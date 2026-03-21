package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.ViTien;
import nhom7.J2EE.SpendwiseAI.service.ViTienService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vi-tien")
public class ViTienController {

    private final ViTienService viTienService;

    public ViTienController(ViTienService viTienService) {
        this.viTienService = viTienService;
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<ViTien>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(viTienService.layTheoChuSoHuu(nguoiDungId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViTien> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(viTienService.layTheoId(id));
    }

    @PostMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<ViTien> tao(@PathVariable UUID nguoiDungId, @RequestBody ViTien viTien) {
        return ResponseEntity.ok(viTienService.taoVi(nguoiDungId, viTien));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViTien> capNhat(@PathVariable UUID id, @RequestBody ViTien viTien) {
        return ResponseEntity.ok(viTienService.capNhat(id, viTien));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        viTienService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
