package nhom7.J2EE.SpendwiseAI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AutoReceiptService {

    private static final Logger log = LoggerFactory.getLogger(AutoReceiptService.class);

    private final ChatClient chatClient;
    private final CloudStorageService cloudStorageService;
    private final GiaoDichService giaoDichService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AutoReceiptService(@Qualifier("geminiChatClient") ChatClient chatClient,
                              CloudStorageService cloudStorageService,
                              GiaoDichService giaoDichService) {
        this.chatClient = chatClient;
        this.cloudStorageService = cloudStorageService;
        this.giaoDichService = giaoDichService;
    }

    /**
     * Xử lý Snap & Save: Up ảnh + Gửi AI + Lưu trực tiếp thành Giao Dịch
     */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public GiaoDich autoSnapAndSave(MultipartFile image, String note, BigDecimal userAmount, UUID viId, UUID userId) {
        // Validate file size trước khi xử lý
        if (image.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Ảnh quá lớn! Giới hạn tối đa 10MB.");
        }

        String imageId = null; // Track để rollback Cloudinary nếu lỗi
        try {
            // 1. Tải ảnh lên Cloudinary
            Map<String, Object> cloudResult = cloudStorageService.uploadImage(image);
            String imageUrl = (String) cloudResult.get("secure_url");
            imageId = (String) cloudResult.get("public_id");

            // 2. Chẩn bị AI Prompt với Note
            byte[] imageBytes = image.getBytes();
            String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
            var imageResource = new org.springframework.core.io.ByteArrayResource(imageBytes);
            
            String safeNote = (note != null && !note.trim().isEmpty()) ? note : "Không có ghi chú thêm.";
            
            String prompt = String.format("""
                    Bạn là trợ lý tài chính thông minh.
                    Người dùng đã tải lên một hình ảnh và kèm theo ghi chú: "%s".
                    Nhiệm vụ của bạn là kết hợp chữ trong hình ảnh (nếu có) và ghi chú của người dùng để xác định giao dịch.
                    
                    Trả lời ĐÚNG ĐỊNH DẠNG JSON thuần (KHÔNG có markdown, KHÔNG có ```):
                    {
                      "tongTien": <tổng tiền của giao dịch, chỉ số nguyên, nếu không thể đoán ra thì để 0>,
                      "moTa": "<Tạo đoạn mô tả giao dịch thật ngắn gọn, ví dụ: 'Ăn trưa ở bún bò', 'Đổ xăng'>",
                      "loai": "<'expense' nếu là chi tiêu, 'income' nếu là thu nhập>"
                    }
                    
                    Lưu ý:
                    - Nếu trong hình là món ăn, hoá đơn mua hàng -> loai = "expense".
                    - Nếu ghi chú có nhắc đến tiền (VD: '50k', 'mua đồ 100 ngàn', 'Mẹ cho 500k') hãy dựa vào để suy ra tongTien và loai.
                    - moTa phản ánh đúng ngữ cảnh hình ảnh và chữ của người dùng.
                    """, safeNote);

            // 3. Gọi Gemini AI
            String response = chatClient.prompt()
                    .user(u -> u.text(prompt)
                            .media(MimeTypeUtils.parseMimeType(mimeType), imageResource))
                    .call()
                    .content();

            log.info("Gemini Snap response: {}", response);
            
            // Xử lý chuỗi JSON rác nếu Gemini trả nhầm Markdown
            String cleanResponse = response.trim()
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            // 4. Đọc kết quả Json
            JsonNode root = objectMapper.readTree(cleanResponse);
            
            BigDecimal tongTien = BigDecimal.ZERO;
            if (root.has("tongTien") && !root.get("tongTien").isNull()) {
                tongTien = new BigDecimal(root.get("tongTien").asText());
            }
            
            // Ưu tiên số tiền user nhập tay nếu có (> 0)
            if (userAmount != null && userAmount.compareTo(BigDecimal.ZERO) > 0) {
                log.info("Sử dụng số tiền user cung cấp: {} thay vì AI: {}", userAmount, tongTien);
                tongTien = userAmount;
            }
            
            String moTa = root.has("moTa") && !root.get("moTa").isNull() ? root.get("moTa").asText() : safeNote;
            String loai = root.has("loai") && !root.get("loai").isNull() ? root.get("loai").asText() : "expense";
            
            // Validate: Loại chỉ có thể là income hoặc expense
            if (!"income".equals(loai) && !"expense".equals(loai)) loai = "expense";

            // 5. Tạo và Lưu Giao Dịch thông qua AutoCategorization
            GiaoDich gd = GiaoDich.builder()
                    .soTien(tongTien)
                    .moTa(moTa)
                    .loai(loai)
                    .hinhAnhUrl(imageUrl)
                    .hinhAnhId(imageId)
                    .ngayGiaoDich(LocalDateTime.now())
                    .aiCategorized(false) // Để GiaoDichService tự check
                    .build();

            return giaoDichService.taoVoiAutoCategory(userId, viId, gd);

        } catch (Exception e) {
            // Rollback: Xoá ảnh orphan trên Cloudinary nếu đã upload thành công
            if (imageId != null) {
                log.warn("Rolling back Cloudinary image due to error: {}", imageId);
                cloudStorageService.deleteImage(imageId);
            }
            log.error("Lỗi khi Snap & Save", e);
            throw new RuntimeException("Lỗi máy chủ khi xử lý Snap: " + e.getMessage());
        }
    }
}
