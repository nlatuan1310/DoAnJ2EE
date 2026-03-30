package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.service.AdminThongKeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/thong-ke")
@PreAuthorize("hasRole('ADMIN')")
public class AdminThongKeController {

    private final AdminThongKeService adminThongKeService;

    public AdminThongKeController(AdminThongKeService adminThongKeService) {
        this.adminThongKeService = adminThongKeService;
    }

    @GetMapping("/tong-quan")
    public ResponseEntity<Map<String, Object>> getTongQuan() {
        return ResponseEntity.ok(adminThongKeService.layThongKeTongQuan());
    }
}
