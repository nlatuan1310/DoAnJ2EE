package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.ai.QuetHoaDonResponse;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.QuetHoaDon;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.service.ReceiptScanService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST API cho chức năng quét hóa đơn (Receipt Scanning).
 * URL mapping: /api/ai/receipt — khớp với frontend ReceiptScanner.tsx
 */
@RestController
@RequestMapping("/api/ai/receipt")
public class ReceiptScanController {

    private final ReceiptScanService receiptScanService;
    private final NguoiDungRepository nguoiDungRepository;

    public ReceiptScanController(ReceiptScanService receiptScanService,
                                 NguoiDungRepository nguoiDungRepository) {
        this.receiptScanService = receiptScanService;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Lấy user hiện tại từ JWT token (giống BaoCaoController).
     */
    private NguoiDung getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    /**
     * Quét hóa đơn từ hình ảnh.
     * POST /api/ai/receipt/scan
     * Content-Type: multipart/form-data
     * Field: "file" (khớp frontend)
     */
    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuetHoaDonResponse> scanReceipt(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        NguoiDung user = getCurrentUser();
        QuetHoaDonResponse response = receiptScanService.scanReceipt(file, user.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch sử scan hóa đơn của user hiện tại.
     * GET /api/ai/receipt/lich-su
     */
    @GetMapping("/lich-su")
    public ResponseEntity<List<QuetHoaDon>> layLichSuScan() {
        NguoiDung user = getCurrentUser();
        return ResponseEntity.ok(receiptScanService.layLichSuScan(user.getId()));
    }

    /**
     * Xem chi tiết 1 lần scan.
     * GET /api/ai/receipt/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuetHoaDon> layChiTiet(@PathVariable UUID id) {
        return ResponseEntity.ok(receiptScanService.layChiTiet(id));
    }
}
