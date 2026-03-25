package nhom7.J2EE.SpendwiseAI.controller;

import jakarta.validation.Valid;
import nhom7.J2EE.SpendwiseAI.dto.DanhMucDTO;
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
    public ResponseEntity<List<DanhMucDTO.DanhMucResponse>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(danhMucService.layTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}/loai/{loai}")
    public ResponseEntity<List<DanhMucDTO.DanhMucResponse>> layTheoLoai(@PathVariable UUID nguoiDungId,
                                                                      @PathVariable String loai) {
        return ResponseEntity.ok(danhMucService.layTheoLoai(nguoiDungId, loai));
    }

    @GetMapping("/{id}/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<DanhMucDTO.DanhMucResponse> layTheoId(@PathVariable Integer id, @PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(danhMucService.layTheoId(id, nguoiDungId));
    }

    @PostMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<DanhMucDTO.DanhMucResponse> tao(@PathVariable UUID nguoiDungId, 
                                                         @Valid @RequestBody DanhMucDTO.DanhMucRequest request) {
        return ResponseEntity.ok(danhMucService.tao(nguoiDungId, request));
    }

    @PutMapping("/{id}/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<DanhMucDTO.DanhMucResponse> capNhat(@PathVariable Integer id, 
                                                            @PathVariable UUID nguoiDungId,
                                                            @Valid @RequestBody DanhMucDTO.DanhMucRequest request) {
        return ResponseEntity.ok(danhMucService.capNhat(id, nguoiDungId, request));
    }

    @DeleteMapping("/{id}/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<Void> xoa(@PathVariable Integer id, @PathVariable UUID nguoiDungId) {
        danhMucService.xoa(id, nguoiDungId);
        return ResponseEntity.noContent().build();
    }
}

