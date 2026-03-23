package nhom7.J2EE.SpendwiseAI.controller.ai;

import nhom7.J2EE.SpendwiseAI.dto.ai.QuetHoaDonResponse;
import nhom7.J2EE.SpendwiseAI.service.ai.ReceiptScannerService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST Controller xử lý quét hóa đơn bằng AI.
 */
@RestController
@RequestMapping("/api/ai/receipt")
public class AiReceiptController {

    private final ReceiptScannerService receiptScannerService;

    public AiReceiptController(ReceiptScannerService receiptScannerService) {
        this.receiptScannerService = receiptScannerService;
    }

    /**
     * Quét hóa đơn từ ảnh.
     *
     * @param file file ảnh hóa đơn (PNG, JPG, WEBP)
     * @return thông tin hóa đơn đã trích xuất dưới dạng JSON
     */
    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuetHoaDonResponse> scanReceipt(@RequestParam("file") MultipartFile file) {
        QuetHoaDonResponse result = receiptScannerService.scanReceipt(file);
        return ResponseEntity.ok(result);
    }
}
