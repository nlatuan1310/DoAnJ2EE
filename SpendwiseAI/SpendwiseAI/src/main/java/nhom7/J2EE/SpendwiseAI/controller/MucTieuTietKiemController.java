package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.DongGopTietKiem;
import nhom7.J2EE.SpendwiseAI.entity.MucTieuTietKiem;
import nhom7.J2EE.SpendwiseAI.service.MucTieuTietKiemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/muc-tieu-tiet-kiem")
public class MucTieuTietKiemController {

    private final MucTieuTietKiemService mucTieuService;

    public MucTieuTietKiemController(MucTieuTietKiemService mucTieuService) {
        this.mucTieuService = mucTieuService;
    }

    @GetMapping
    public ResponseEntity<List<MucTieuTietKiem>> layTatCa() {
        return ResponseEntity.ok(mucTieuService.layTatCa());
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<MucTieuTietKiem>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(mucTieuService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MucTieuTietKiem> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(mucTieuService.layTheoId(id));
    }

    @PostMapping
    public ResponseEntity<MucTieuTietKiem> tao(@RequestParam UUID nguoiDungId,
                                                @RequestParam UUID viId,
                                                @RequestBody MucTieuTietKiem mucTieu) {
        return ResponseEntity.ok(mucTieuService.tao(nguoiDungId, viId, mucTieu));
    }

    @PostMapping("/{id}/dong-gop")
    public ResponseEntity<DongGopTietKiem> dongGop(@PathVariable UUID id,
                                                    @RequestParam BigDecimal soTien) {
        return ResponseEntity.ok(mucTieuService.dongGop(id, soTien));
    }

    @GetMapping("/{id}/dong-gop")
    public ResponseEntity<List<DongGopTietKiem>> layDongGop(@PathVariable UUID id) {
        return ResponseEntity.ok(mucTieuService.layDongGop(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        mucTieuService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
