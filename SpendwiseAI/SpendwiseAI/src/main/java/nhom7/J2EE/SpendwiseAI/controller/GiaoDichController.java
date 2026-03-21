package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import nhom7.J2EE.SpendwiseAI.service.GiaoDichService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/giao-dich")
public class GiaoDichController {

    private final GiaoDichService giaoDichService;

    public GiaoDichController(GiaoDichService giaoDichService) {
        this.giaoDichService = giaoDichService;
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
        giaoDichService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
