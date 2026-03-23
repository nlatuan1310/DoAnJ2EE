package nhom7.J2EE.SpendwiseAI.service.ai;


import nhom7.J2EE.SpendwiseAI.dto.ai.QuetHoaDonResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.content.Media;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;
import org.springframework.web.multipart.MultipartFile;

/**
 * Implementation sử dụng Google Gemini (qua Spring AI) để quét hóa đơn.
 */
@Service
public class GeminiReceiptScannerServiceImpl implements ReceiptScannerService {

    private static final Logger log = LoggerFactory.getLogger(GeminiReceiptScannerServiceImpl.class);

    private final ChatClient chatClient;


    private static final String SYSTEM_PROMPT = """
            Bạn là một trợ lý AI chuyên phân tích hóa đơn mua hàng.
            Nhiệm vụ: Nhận ảnh hóa đơn và trích xuất thông tin chi tiết.

            Quy tắc:
            1. Trả về ĐÚNG định dạng JSON, KHÔNG kèm markdown code block.
            2. Số tiền dùng số thuần (VD: 150000, không dùng "150.000đ").
            3. Ngày giao dịch theo định dạng dd/MM/yyyy.
            4. Nếu không đọc được trường nào, để giá trị null.
            5. Luôn trả về tiếng Việt.

            Định dạng JSON bắt buộc:
            {
              "tenCuaHang": "Tên cửa hàng",
              "ngayGiaoDich": "dd/MM/yyyy",
              "tongTien": 150000,
              "danhSachSanPham": [
                {
                  "tenSanPham": "Tên sản phẩm",
                  "soLuong": 1,
                  "donGia": 50000,
                  "thanhTien": 50000
                }
              ],
              "ghiChu": "Ghi chú bổ sung (phương thức thanh toán, mã hóa đơn, ...)"
            }
            """;

    public GeminiReceiptScannerServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .build();
    }

    @Override
    public QuetHoaDonResponse scanReceipt(MultipartFile imageFile) {
        // Validate file
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("File ảnh hóa đơn không được để trống.");
        }

        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File phải là ảnh (PNG, JPG, WEBP). Loại nhận được: " + contentType);
        }

        try {
            // Tạo Media object từ ảnh
            MimeType mimeType = MimeType.valueOf(contentType);
            Media imageMedia = Media.builder()
                    .mimeType(mimeType)
                    .data(imageFile.getBytes())
                    .build();

            // Gửi prompt multimodal tới Gemini và tự động ép kiểu bằng Spring AI .entity()
            QuetHoaDonResponse result = chatClient.prompt()
                    .user(u -> u
                            .text("Hãy phân tích hóa đơn trong ảnh này và trích xuất thông tin theo định dạng JSON đã quy định.")
                            .media(imageMedia))
                    .call()
                    .entity(QuetHoaDonResponse.class);

            log.info("Gemini response mapped to DTO: {}", result);

            return result;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi quét hóa đơn với Gemini: ", e);
            throw new RuntimeException("Không thể phân tích hóa đơn. Vui lòng thử lại với ảnh rõ hơn.", e);
        }
    }
}
