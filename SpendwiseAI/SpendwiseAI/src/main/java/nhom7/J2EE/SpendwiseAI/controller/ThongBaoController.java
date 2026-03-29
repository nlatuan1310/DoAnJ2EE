package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.ThongBao;
import nhom7.J2EE.SpendwiseAI.service.ThongBaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/thong-bao")
public class ThongBaoController {

    private final ThongBaoService thongBaoService;

    public ThongBaoController(ThongBaoService thongBaoService) {
        this.thongBaoService = thongBaoService;
    }

    /**
     * Lấy toàn bộ thông báo của người dùng (mới nhất trước).
     */
    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<ThongBao>> layTatCa(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(thongBaoService.layTheoNguoiDung(nguoiDungId));
    }

    /**
     * Đếm số thông báo chưa đọc (để hiển thị badge đỏ trên chuông 🔔).
     */
    @GetMapping("/nguoi-dung/{nguoiDungId}/chua-doc")
    public ResponseEntity<Map<String, Long>> demChuaDoc(@PathVariable UUID nguoiDungId) {
        long count = thongBaoService.demChuaDoc(nguoiDungId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Đánh dấu 1 thông báo đã đọc.
     */
    @PutMapping("/{id}/da-doc")
    public ResponseEntity<Void> danhDauDaDoc(@PathVariable UUID id) {
        thongBaoService.danhDauDaDoc(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Đánh dấu TẤT CẢ thông báo đã đọc.
     */
    @PutMapping("/nguoi-dung/{nguoiDungId}/doc-tat-ca")
    public ResponseEntity<Void> docTatCa(@PathVariable UUID nguoiDungId) {
        thongBaoService.danhDauTatCaDaDoc(nguoiDungId);
        return ResponseEntity.ok().build();
    }
}
