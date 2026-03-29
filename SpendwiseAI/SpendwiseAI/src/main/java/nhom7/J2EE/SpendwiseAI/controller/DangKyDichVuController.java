package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.DangKyDichVu;
import nhom7.J2EE.SpendwiseAI.service.DangKyDichVuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dang-ky-dich-vu")
public class DangKyDichVuController {

    private final DangKyDichVuService dangKyDichVuService;

    public DangKyDichVuController(DangKyDichVuService dangKyDichVuService) {
        this.dangKyDichVuService = dangKyDichVuService;
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<DangKyDichVu>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(dangKyDichVuService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DangKyDichVu> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(dangKyDichVuService.layTheoId(id));
    }

    @PostMapping
    public ResponseEntity<DangKyDichVu> tao(@RequestParam UUID nguoiDungId,
                                              @RequestParam UUID viId,
                                              @RequestParam Integer danhMucId,
                                              @RequestBody DangKyDichVu dkdv) {
        return ResponseEntity.ok(dangKyDichVuService.tao(nguoiDungId, viId, danhMucId, dkdv));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DangKyDichVu> capNhat(@PathVariable UUID id,
                                                  @RequestBody DangKyDichVu dkdv) {
        return ResponseEntity.ok(dangKyDichVuService.capNhat(id, dkdv));
    }

    @GetMapping("/sap-den-han")
    public ResponseEntity<List<DangKyDichVu>> laySapDenHan(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(dangKyDichVuService.laySapDenHan(java.time.LocalDate.now().plusDays(days)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        dangKyDichVuService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
