package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.NganSach;
import nhom7.J2EE.SpendwiseAI.service.NganSachService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngan-sach")
public class NganSachController {

    private final NganSachService nganSachService;

    public NganSachController(NganSachService nganSachService) {
        this.nganSachService = nganSachService;
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<NganSach>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(nganSachService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NganSach> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(nganSachService.layTheoId(id));
    }

    @PostMapping
    public ResponseEntity<NganSach> tao(@RequestParam UUID nguoiDungId,
                                         @RequestParam UUID viId,
                                         @RequestParam Integer danhMucId,
                                         @RequestBody NganSach nganSach) {
        return ResponseEntity.ok(nganSachService.tao(nguoiDungId, viId, danhMucId, nganSach));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NganSach> capNhat(@PathVariable UUID id, @RequestBody NganSach nganSach) {
        return ResponseEntity.ok(nganSachService.capNhat(id, nganSach));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        nganSachService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
