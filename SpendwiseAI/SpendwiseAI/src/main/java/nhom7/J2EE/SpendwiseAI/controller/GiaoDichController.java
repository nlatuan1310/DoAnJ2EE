package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.ai.AutoCategorizeDTO;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.service.AutoCategorizationService;
import nhom7.J2EE.SpendwiseAI.service.GiaoDichService;
import nhom7.J2EE.SpendwiseAI.service.LichSuTimKiemService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/giao-dich")
public class GiaoDichController {

    private final GiaoDichService giaoDichService;
    private final AutoCategorizationService autoCategorizationService;
    private final LichSuTimKiemService lichSuTimKiemService;
    private final NguoiDungRepository nguoiDungRepository;

    public GiaoDichController(GiaoDichService giaoDichService,
                              AutoCategorizationService autoCategorizationService,
                              LichSuTimKiemService lichSuTimKiemService,
                              NguoiDungRepository nguoiDungRepository) {
        this.giaoDichService = giaoDichService;
        this.autoCategorizationService = autoCategorizationService;
        this.lichSuTimKiemService = lichSuTimKiemService;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Lấy user hiện tại từ JWT token.
     */
    private NguoiDung getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    /**
     * Tìm kiếm nâng cao (Advanced Search) — phân trang + đa điều kiện.
     * Tự động lưu lịch sử tìm kiếm khi có keyword.
     */
    @GetMapping("/tim-kiem")
    public ResponseEntity<Page<GiaoDich>> timKiemNangCao(
            @RequestParam UUID nguoiDungId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String loai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            @RequestParam(required = false) BigDecimal tuSoTien,
            @RequestParam(required = false) BigDecimal denSoTien,
            @RequestParam(required = false) Integer danhMucId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ngayGiaoDich") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Lưu lịch sử tìm kiếm nếu có keyword
        if (keyword != null && !keyword.trim().isEmpty()) {
            try {
                lichSuTimKiemService.luuLichSu(nguoiDungId, keyword, null);
            } catch (Exception e) {
                // Không block request chính nếu lưu lịch sử thất bại
            }
        }

        Page<GiaoDich> result = giaoDichService.timKiemNangCao(
                nguoiDungId, keyword, loai, tuNgay, denNgay,
                tuSoTien, denSoTien, danhMucId, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<GiaoDich>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(giaoDichService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/vi/{viId}")
    public ResponseEntity<List<GiaoDich>> layTheoVi(@PathVariable UUID viId) {
        return ResponseEntity.ok(giaoDichService.layTheoVi(viId));
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}/thoi-gian")
    public ResponseEntity<List<GiaoDich>> layTheoThoiGian(
            @PathVariable UUID nguoiDungId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        return ResponseEntity.ok(giaoDichService.layTheoKhoangThoiGian(nguoiDungId, tuNgay, denNgay));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GiaoDich> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(giaoDichService.layTheoId(id));
    }

    @PostMapping
    public ResponseEntity<GiaoDich> tao(@RequestParam UUID nguoiDungId,
                                         @RequestParam UUID viId,
                                         @RequestParam Integer danhMucId,
                                         @RequestBody GiaoDich giaoDich) {
        return ResponseEntity.ok(giaoDichService.tao(nguoiDungId, viId, danhMucId, giaoDich));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        NguoiDung user = getCurrentUser();
        giaoDichService.xoa(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * API chuyên dụng lấy danh sách các Giao dịch dạng Snap (Locket Feed)
     * Chỉ trả về các giao dịch có chứa hình ảnh.
     */
    @GetMapping("/snap-feed")
    public ResponseEntity<Page<GiaoDich>> laySnapFeed(
            @RequestParam UUID nguoiDungId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("ngayGiaoDich").descending());
        return ResponseEntity.ok(giaoDichService.laySnapFeed(nguoiDungId, pageable));
    }

    // =============================================
    // Auto-Categorization Endpoints
    // =============================================

    /**
     * Gợi ý danh mục từ mô tả giao dịch (preview, chưa lưu).
     * Dùng khi user đang nhập form và muốn AI phân loại trước.
     */
    @PostMapping("/goi-y-danh-muc")
    public ResponseEntity<AutoCategorizeDTO.SuggestResponse> goiYDanhMuc(
            @RequestParam UUID nguoiDungId,
            @RequestBody AutoCategorizeDTO.SuggestRequest request) {

        AutoCategorizeDTO.SuggestResponse response = autoCategorizationService.goiYDanhMuc(
                request.getMoTa(), request.getLoai(), nguoiDungId);

        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo giao dịch mới với phân loại tự động bằng AI.
     * AI sẽ gợi ý danh mục dựa trên mô tả giao dịch.
     */
    @PostMapping("/tao-tu-dong")
    public ResponseEntity<GiaoDich> taoVoiAutoCategory(
            @RequestParam UUID nguoiDungId,
            @RequestParam UUID viId,
            @RequestBody GiaoDich giaoDich) {
        return ResponseEntity.ok(giaoDichService.taoVoiAutoCategory(nguoiDungId, viId, giaoDich));
    }

    // =============================================
    // Hóa đơn đính kèm giao dịch
    // =============================================

    /**
     * Lưu chi tiết hóa đơn (ảnh + nội dung OCR) đính kèm 1 giao dịch.
     */
    @PostMapping("/{giaoDichId}/hoa-don")
    public ResponseEntity<?> luuHoaDon(
            @PathVariable UUID giaoDichId,
            @RequestParam(required = false) String anhHoaDon,
            @RequestParam(required = false) String noiDungOcr) {
        return ResponseEntity.ok(giaoDichService.luuHoaDon(giaoDichId, anhHoaDon, noiDungOcr));
    }

    /**
     * Lấy danh sách hóa đơn đính kèm của 1 giao dịch.
     */
    @GetMapping("/{giaoDichId}/hoa-don")
    public ResponseEntity<?> layHoaDon(@PathVariable UUID giaoDichId) {
        return ResponseEntity.ok(giaoDichService.layHoaDon(giaoDichId));
    }
}

