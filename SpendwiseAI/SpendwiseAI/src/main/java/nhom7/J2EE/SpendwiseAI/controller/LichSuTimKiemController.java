package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.LichSuTimKiem;
import nhom7.J2EE.SpendwiseAI.service.LichSuTimKiemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lich-su-tim-kiem")
public class LichSuTimKiemController {

    private final LichSuTimKiemService lichSuTimKiemService;

    public LichSuTimKiemController(LichSuTimKiemService lichSuTimKiemService) {
        this.lichSuTimKiemService = lichSuTimKiemService;
    }

    /**
     * Lấy 10 từ khoá tìm kiếm gần đây của người dùng.
     */
    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<LichSuTimKiem>> layLichSu(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(lichSuTimKiemService.layLichSuGanDay(nguoiDungId));
    }

    /**
     * Lưu từ khoá tìm kiếm (frontend gọi trực tiếp).
     */
    @PostMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<Void> luuLichSu(@PathVariable UUID nguoiDungId,
                                           @RequestParam String tuKhoa) {
        lichSuTimKiemService.luuLichSu(nguoiDungId, tuKhoa, null);
        return ResponseEntity.ok().build();
    }

    /**
     * Xoá 1 bản ghi lịch sử tìm kiếm.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        lichSuTimKiemService.xoa(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xoá toàn bộ lịch sử tìm kiếm của người dùng.
     */
    @DeleteMapping("/nguoi-dung/{nguoiDungId}/xoa-tat-ca")
    public ResponseEntity<Void> xoaTatCa(@PathVariable UUID nguoiDungId) {
        lichSuTimKiemService.xoaTatCa(nguoiDungId);
        return ResponseEntity.noContent().build();
    }
}
