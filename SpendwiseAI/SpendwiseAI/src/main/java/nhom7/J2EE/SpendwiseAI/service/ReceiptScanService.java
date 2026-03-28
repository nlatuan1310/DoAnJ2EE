package nhom7.J2EE.SpendwiseAI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import nhom7.J2EE.SpendwiseAI.dto.ai.QuetHoaDonResponse;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.QuetHoaDon;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.QuetHoaDonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service quét hóa đơn (receipt scanning) bằng Google Gemini AI.
 * Sử dụng Gemini multimodal để phân tích hình ảnh hóa đơn
 * và trích xuất thông tin: tên cửa hàng, ngày, tổng tiền, danh sách sản phẩm.
 */
@Service
public class ReceiptScanService {

    private static final Logger log = LoggerFactory.getLogger(ReceiptScanService.class);

    private final ChatClient chatClient;
    private final QuetHoaDonRepository quetHoaDonRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReceiptScanService(@Qualifier("geminiChatClient") ChatClient chatClient,
                              QuetHoaDonRepository quetHoaDonRepository,
                              NguoiDungRepository nguoiDungRepository) {
        this.chatClient = chatClient;
        this.quetHoaDonRepository = quetHoaDonRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Quét hóa đơn từ hình ảnh, trích xuất thông tin và lưu vào DB.
     *
     * @param image      File hình ảnh hóa đơn (jpg, png, ...)
     * @param nguoiDungId ID người dùng
     * @return QuetHoaDonResponse chứa thông tin trích xuất
     */
    public QuetHoaDonResponse scanReceipt(MultipartFile image, UUID nguoiDungId) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));

        try {
            // 1. Convert image to Base64
            byte[] imageBytes = image.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // 2. Determine MIME type
            String mimeType = image.getContentType();
            if (mimeType == null || mimeType.isBlank()) {
                mimeType = "image/jpeg";
            }
            final String contentType = mimeType;

            // 3. Build prompt for Gemini multimodal
            String prompt = """
                    Bạn là hệ thống OCR thông minh chuyên đọc hóa đơn/receipt.
                    Hãy phân tích hình ảnh hóa đơn này và trích xuất thông tin sau.
                    
                    Trả lời ĐÚNG ĐỊNH DẠNG JSON thuần (KHÔNG có markdown, KHÔNG có ```):
                    {
                      "tenCuaHang": "<tên cửa hàng/nhà cung cấp>",
                      "ngayGiaoDich": "<ngày trên hóa đơn, định dạng dd/MM/yyyy>",
                      "tongTien": <tổng tiền thanh toán, số không có dấu phân cách>,
                      "danhSachSanPham": [
                        {
                          "tenSanPham": "<tên sản phẩm>",
                          "soLuong": <số lượng>,
                          "donGia": <đơn giá>,
                          "thanhTien": <thành tiền>
                        }
                      ],
                      "ghiChu": "<ghi chú: phương thức thanh toán, mã hóa đơn, v.v.>"
                    }
                    
                    Quy tắc:
                    - Nếu không đọc được thông tin nào, để giá trị null
                    - tongTien phải là số (không có ký tự tiền tệ)
                    - Ngày phải theo định dạng dd/MM/yyyy
                    - Trả về JSON thuần, không wrap trong markdown
                    """;

            // 4. Call Gemini AI with multimodal (image + text)
            var imageResource = new org.springframework.core.io.ByteArrayResource(imageBytes);
            String response = chatClient.prompt()
                    .user(u -> u.text(prompt)
                            .media(MimeTypeUtils.parseMimeType(contentType), imageResource))
                    .call()
                    .content();

            log.info("Gemini response for receipt scan: {}", response);

            // 5. Parse JSON response
            String cleanResponse = response.trim()
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            QuetHoaDonResponse result = parseResponse(cleanResponse);

            // 6. Save to database
            QuetHoaDon entity = QuetHoaDon.builder()
                    .nguoiDung(nguoiDung)
                    .anhHoaDon(base64Image)
                    .noiDungOcr(cleanResponse)
                    .tongTienAi(result.getTongTien())
                    .cuaHangAi(result.getTenCuaHang())
                    .ngayHoaDon(parseDate(result.getNgayGiaoDich()))
                    .build();

            quetHoaDonRepository.save(entity);

            return result;

        } catch (Exception e) {
            log.error("Lỗi khi quét hóa đơn: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể quét hóa đơn: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy lịch sử scan hóa đơn của user.
     */
    public List<QuetHoaDon> layLichSuScan(UUID nguoiDungId) {
        return quetHoaDonRepository.findByNguoiDungId(nguoiDungId);
    }

    /**
     * Lấy chi tiết 1 lần scan.
     */
    public QuetHoaDon layChiTiet(UUID id) {
        return quetHoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả scan: " + id));
    }

    // =========================================
    // Private helpers
    // =========================================

    private QuetHoaDonResponse parseResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);

            List<QuetHoaDonResponse.SanPham> sanPhams = new ArrayList<>();
            JsonNode dsNode = root.get("danhSachSanPham");
            if (dsNode != null && dsNode.isArray()) {
                for (JsonNode item : dsNode) {
                    sanPhams.add(QuetHoaDonResponse.SanPham.builder()
                            .tenSanPham(getTextOrNull(item, "tenSanPham"))
                            .soLuong(item.has("soLuong") && !item.get("soLuong").isNull()
                                    ? item.get("soLuong").asInt() : null)
                            .donGia(getDecimalOrNull(item, "donGia"))
                            .thanhTien(getDecimalOrNull(item, "thanhTien"))
                            .build());
                }
            }

            return QuetHoaDonResponse.builder()
                    .tenCuaHang(getTextOrNull(root, "tenCuaHang"))
                    .ngayGiaoDich(getTextOrNull(root, "ngayGiaoDich"))
                    .tongTien(getDecimalOrNull(root, "tongTien"))
                    .danhSachSanPham(sanPhams)
                    .ghiChu(getTextOrNull(root, "ghiChu"))
                    .build();

        } catch (Exception e) {
            log.error("Lỗi parse JSON response: {}", e.getMessage());
            return QuetHoaDonResponse.builder()
                    .ghiChu("Không thể parse kết quả AI: " + json)
                    .build();
        }
    }

    private String getTextOrNull(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText() : null;
    }

    private BigDecimal getDecimalOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            try {
                return new BigDecimal(node.get(field).asText());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            log.warn("Không thể parse ngày: {}", dateStr);
            return null;
        }
    }
}
