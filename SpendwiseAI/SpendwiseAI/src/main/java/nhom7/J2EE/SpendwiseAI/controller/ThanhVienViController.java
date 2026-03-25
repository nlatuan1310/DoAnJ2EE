package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.ThanhVienVi;
import nhom7.J2EE.SpendwiseAI.service.ThanhVienViService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/thanh-vien-vi")
public class ThanhVienViController {

    private final ThanhVienViService thanhVienViService;

    public ThanhVienViController(ThanhVienViService thanhVienViService) {
        this.thanhVienViService = thanhVienViService;
    }

    /**
     * Lấy danh sách thành viên của một ví
     * GET /api/thanh-vien-vi/{viId}
     */
    @GetMapping("/{viId}")
    public ResponseEntity<List<ThanhVienVi>> layThanhVien(@PathVariable UUID viId) {
        return ResponseEntity.ok(thanhVienViService.layThanhVienTheoVi(viId));
    }

    /**
     * Lấy danh sách ví mà người dùng là thành viên
     * GET /api/thanh-vien-vi/nguoi-dung/{nguoiDungId}
     */
    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<ThanhVienVi>> layViTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(thanhVienViService.layViTheoNguoiDung(nguoiDungId));
    }

    /**
     * Thêm thành viên vào ví
     * POST /api/thanh-vien-vi/{viId}/them?nguoiDungId=&vaiTro=
     */
    @PostMapping("/{viId}/them")
    public ResponseEntity<ThanhVienVi> themThanhVien(
            @PathVariable UUID viId,
            @RequestParam UUID nguoiDungId,
            @RequestParam(defaultValue = "viewer") String vaiTro) {
        return ResponseEntity.ok(thanhVienViService.themThanhVien(viId, nguoiDungId, vaiTro));
    }

    /**
     * Xóa thành viên khỏi ví
     * DELETE /api/thanh-vien-vi/{viId}/xoa/{nguoiDungId}
     */
    @DeleteMapping("/{viId}/xoa/{nguoiDungId}")
    public ResponseEntity<Void> xoaThanhVien(
            @PathVariable UUID viId,
            @PathVariable UUID nguoiDungId) {
        thanhVienViService.xoaThanhVien(viId, nguoiDungId);
        return ResponseEntity.noContent().build();
    }
}
