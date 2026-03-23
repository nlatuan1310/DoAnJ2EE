package nhom7.J2EE.SpendwiseAI.service.ai;

import nhom7.J2EE.SpendwiseAI.dto.ai.QuetHoaDonResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interface quét hóa đơn – Strategy Pattern.
 * Có thể swap implementation (Gemini, OpenAI, ...) mà không ảnh hưởng Controller.
 */
public interface ReceiptScannerService {

    /**
     * Phân tích ảnh hóa đơn và trích xuất thông tin.
     *
     * @param imageFile file ảnh hóa đơn (PNG, JPG, WEBP)
     * @return thông tin hóa đơn đã trích xuất
     */
    QuetHoaDonResponse scanReceipt(MultipartFile imageFile);
}
