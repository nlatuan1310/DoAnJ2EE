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
    private final nhom7.J2EE.SpendwiseAI.service.UserExcelImportService userExcelImportService;

    public NguoiDungController(NguoiDungService nguoiDungService, nhom7.J2EE.SpendwiseAI.service.UserExcelImportService userExcelImportService) {
        this.nguoiDungService = nguoiDungService;
        this.userExcelImportService = userExcelImportService;
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

    @PatchMapping("/{id}/vai-tro")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NguoiDung> doiVaiTro(@PathVariable UUID id, @RequestBody java.util.Map<String, String> body) {
        String vaiTroMoi = body.get("vaiTro");
        if (vaiTroMoi == null || (!vaiTroMoi.equals("admin") && !vaiTroMoi.equals("user"))) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(nguoiDungService.doiVaiTro(id, vaiTroMoi));
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NguoiDung> doiTrangThai(@PathVariable UUID id, @RequestBody java.util.Map<String, Boolean> body) {
        Boolean trangThai = body.get("trangThai");
        if (trangThai == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(nguoiDungService.doiTrangThai(id, trangThai));
    }

    @PostMapping("/import-excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> importExcel(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(userExcelImportService.importUsersFromExcel(file));
    }
}
