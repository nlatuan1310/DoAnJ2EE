package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import nhom7.J2EE.SpendwiseAI.service.DanhMucService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/danh-muc")
public class DanhMucController {

    private final DanhMucService danhMucService;

    public DanhMucController(DanhMucService danhMucService) {
        this.danhMucService = danhMucService;
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<DanhMuc>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(danhMucService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}/loai/{loai}")
    public ResponseEntity<List<DanhMuc>> layTheoLoai(@PathVariable UUID nguoiDungId,
                                                      @PathVariable String loai) {
        return ResponseEntity.ok(danhMucService.layTheoLoai(nguoiDungId, loai));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DanhMuc> layTheoId(@PathVariable Integer id) {
        return ResponseEntity.ok(danhMucService.layTheoId(id));
    }

    @PostMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<DanhMuc> tao(@PathVariable UUID nguoiDungId, @RequestBody DanhMuc danhMuc) {
        return ResponseEntity.ok(danhMucService.tao(nguoiDungId, danhMuc));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhMuc> capNhat(@PathVariable Integer id, @RequestBody DanhMuc danhMuc) {
        return ResponseEntity.ok(danhMucService.capNhat(id, danhMuc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable Integer id) {
        danhMucService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
