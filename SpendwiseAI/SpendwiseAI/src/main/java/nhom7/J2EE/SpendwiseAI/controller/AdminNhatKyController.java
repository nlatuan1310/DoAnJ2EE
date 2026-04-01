package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.NhatKyAdmin;
import nhom7.J2EE.SpendwiseAI.service.NhatKyAdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/nhat-ky")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNhatKyController {

    private final NhatKyAdminService nhatKyAdminService;

    public AdminNhatKyController(NhatKyAdminService nhatKyAdminService) {
        this.nhatKyAdminService = nhatKyAdminService;
    }

    @GetMapping
    public ResponseEntity<Page<NhatKyAdmin>> layNhatKyPhanTrang(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(nhatKyAdminService.layNhatKyPhanTrang(pageable));
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<NhatKyAdmin>> layNhatKyTheoAdmin(@PathVariable UUID adminId) {
        return ResponseEntity.ok(nhatKyAdminService.layTheoAdmin(adminId));
    }

    @GetMapping("/bang/{bangDuLieu}")
    public ResponseEntity<List<NhatKyAdmin>> layNhatKyTheoBang(@PathVariable String bangDuLieu) {
        return ResponseEntity.ok(nhatKyAdminService.layTheoBangDuLieu(bangDuLieu));
    }
}
