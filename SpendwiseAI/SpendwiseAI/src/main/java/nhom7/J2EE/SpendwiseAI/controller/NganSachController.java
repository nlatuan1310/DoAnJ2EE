package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.NganSachDTO;
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
    public ResponseEntity<List<NganSachDTO.NganSachResponse>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(nganSachService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NganSachDTO.NganSachResponse> layTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(nganSachService.layTheoId(id));
    }

    @PostMapping
    public ResponseEntity<NganSachDTO.NganSachResponse> tao(@RequestBody NganSachDTO.NganSachRequest request) {
        return ResponseEntity.ok(nganSachService.tao(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NganSachDTO.NganSachResponse> capNhat(@PathVariable UUID id, @RequestBody NganSachDTO.NganSachRequest request) {
        return ResponseEntity.ok(nganSachService.capNhat(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable UUID id) {
        nganSachService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
