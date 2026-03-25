package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.service.NguoiDungService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/nguoi-dung")
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    public NguoiDungController(NguoiDungService nguoiDungService) {
        this.nguoiDungService = nguoiDungService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NguoiDung>> layTatCa() {
        return ResponseEntity.ok(nguoiDungService.layTatCa());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NguoiDung> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(nguoiDungService.layTheoId(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<NguoiDung> layTheoEmail(@PathVariable String email) {
        return ResponseEntity.ok(nguoiDungService.layTheoEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NguoiDung> capNhat(@PathVariable UUID id, @RequestBody NguoiDung nguoiDung) {
        return ResponseEntity.ok(nguoiDungService.capNhat(id, nguoiDung));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        nguoiDungService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
