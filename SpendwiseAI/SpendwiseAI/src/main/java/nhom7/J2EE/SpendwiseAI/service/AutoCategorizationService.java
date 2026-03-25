package nhom7.J2EE.SpendwiseAI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import nhom7.J2EE.SpendwiseAI.dto.ai.AutoCategorizeDTO;
import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service phân loại chi tiêu tự động bằng Google Gemini AI.
 * Dựa vào mô tả giao dịch, AI sẽ gợi ý danh mục phù hợp nhất
 * từ danh sách danh mục hiện có của user.
 */
@Service
public class AutoCategorizationService {

    private static final Logger log = LoggerFactory.getLogger(AutoCategorizationService.class);

    private final ChatClient chatClient;
    private final DanhMucRepository danhMucRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AutoCategorizationService(ChatClient.Builder chatClientBuilder,
                                     DanhMucRepository danhMucRepository) {
        this.chatClient = chatClientBuilder.build();
        this.danhMucRepository = danhMucRepository;
    }

    /**
     * Gợi ý danh mục phù hợp nhất cho giao dịch dựa trên mô tả.
     *
     * @param moTa       Mô tả giao dịch (vd: "Grab taxi đi làm")
     * @param loai       Loại giao dịch: "income" hoặc "expense"
     * @param nguoiDungId ID người dùng
     * @return SuggestResponse chứa danh mục gợi ý + độ tin cậy, hoặc null nếu không thể phân loại
     */
    public AutoCategorizeDTO.SuggestResponse goiYDanhMuc(String moTa, String loai, UUID nguoiDungId) {
        // 1. Lấy danh sách danh mục của user, filter theo loại (thu → income, chi → expense)
        String loaiDanhMuc = mapLoaiGiaoDichToLoaiDanhMuc(loai);
        List<DanhMuc> danhMucs = danhMucRepository.findByNguoiDungIdAndLoai(nguoiDungId, loaiDanhMuc);

        if (danhMucs.isEmpty()) {
            // Thử lấy tất cả danh mục nếu không có theo loại
            danhMucs = danhMucRepository.findByNguoiDungId(nguoiDungId);
        }

        if (danhMucs.isEmpty()) {
            log.warn("User {} chưa có danh mục nào, không thể auto-categorize", nguoiDungId);
            return null;
        }

        // 2. Build prompt
        String danhSachTen = danhMucs.stream()
                .map(DanhMuc::getTenDanhMuc)
                .collect(Collectors.joining(", "));

        String prompt = String.format("""
                Bạn là hệ thống phân loại chi tiêu thông minh. Dựa vào mô tả giao dịch dưới đây, \
                hãy chọn MỘT danh mục phù hợp nhất từ danh sách cho sẵn.

                Mô tả giao dịch: "%s"
                Loại giao dịch: %s

                Danh sách danh mục có sẵn: [%s]

                Trả lời ĐÚNG ĐỊNH DẠNG JSON thuần (KHÔNG có markdown, KHÔNG có ```):
                {"danhMuc": "<tên danh mục chính xác từ danh sách>", "doTinCay": <số từ 0.0 đến 1.0>}

                Quy tắc:
                - Chỉ chọn danh mục có trong danh sách, KHÔNG tự tạo tên mới
                - doTinCay = 1.0 nếu rất chắc chắn, 0.5 nếu tạm được, dưới 0.3 nếu không chắc
                - Nếu không có danh mục nào phù hợp, chọn danh mục gần nhất và đặt doTinCay thấp
                """, moTa, loai, danhSachTen);

        try {
            // 3. Gọi Gemini AI
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.info("Gemini response for auto-categorize: {}", response);

            // 4. Parse JSON response
            String cleanResponse = response.trim()
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            JsonNode jsonNode = objectMapper.readTree(cleanResponse);
            String tenDanhMuc = jsonNode.get("danhMuc").asText().trim();
            double doTinCay = jsonNode.has("doTinCay") ? jsonNode.get("doTinCay").asDouble() : 0.5;

            // 5. Match với entity DanhMuc (case-insensitive)
            DanhMuc matched = danhMucs.stream()
                    .filter(dm -> dm.getTenDanhMuc().trim().equalsIgnoreCase(tenDanhMuc))
                    .findFirst()
                    .orElse(null);

            if (matched != null) {
                return AutoCategorizeDTO.SuggestResponse.builder()
                        .danhMucId(matched.getId())
                        .tenDanhMuc(matched.getTenDanhMuc())
                        .doTinCay(doTinCay)
                        .build();
            } else {
                log.warn("AI trả về danh mục '{}' không khớp với danh sách", tenDanhMuc);
                // Thử fuzzy match (contains)
                DanhMuc fuzzyMatch = danhMucs.stream()
                        .filter(dm -> dm.getTenDanhMuc().toLowerCase().contains(tenDanhMuc.toLowerCase())
                                || tenDanhMuc.toLowerCase().contains(dm.getTenDanhMuc().toLowerCase()))
                        .findFirst()
                        .orElse(null);

                if (fuzzyMatch != null) {
                    return AutoCategorizeDTO.SuggestResponse.builder()
                            .danhMucId(fuzzyMatch.getId())
                            .tenDanhMuc(fuzzyMatch.getTenDanhMuc())
                            .doTinCay(doTinCay * 0.8) // Giảm confidence vì fuzzy match
                            .build();
                }
                return null;
            }

        } catch (Exception e) {
            log.error("Lỗi khi gọi AI auto-categorize: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Map loại giao dịch (income/expense) sang loại danh mục (thu/chi).
     */
    private String mapLoaiGiaoDichToLoaiDanhMuc(String loaiGiaoDich) {
        if ("income".equalsIgnoreCase(loaiGiaoDich)) return "thu";
        if ("expense".equalsIgnoreCase(loaiGiaoDich)) return "chi";
        return loaiGiaoDich;
    }
}
