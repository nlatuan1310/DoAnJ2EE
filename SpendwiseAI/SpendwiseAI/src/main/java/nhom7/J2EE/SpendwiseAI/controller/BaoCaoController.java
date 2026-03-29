package nhom7.J2EE.SpendwiseAI.controller;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.BaoCao;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.service.BaoCaoService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class BaoCaoController {

    private final BaoCaoService baoCaoService;
    private final NguoiDungRepository nguoiDungRepository;

    private NguoiDung getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<InputStreamResource> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "monthly") String loai) {

        NguoiDung user = getCurrentUser();
        ByteArrayInputStream out = baoCaoService.exportExcel(user.getId(), start, end, loai);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=BaoCao_" + user.getHoVaTen() + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(out));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<InputStreamResource> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "monthly") String loai) {

        NguoiDung user = getCurrentUser();
        ByteArrayInputStream out = baoCaoService.exportPdf(user.getId(), start, end, loai);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=BaoCao_" + user.getHoVaTen() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(out));
    }

    @GetMapping
    public ResponseEntity<List<BaoCao>> getHistory() {
        NguoiDung user = getCurrentUser();
        return ResponseEntity.ok(baoCaoService.findByNguoiDung(user.getId()));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<InputStreamResource> downloadReport(@PathVariable("id") UUID id) {
        BaoCao report = baoCaoService.findById(id);
        
        // Cần verify xem report này có thuộc user hiện tại không
        NguoiDung currentUser = getCurrentUser();
        if (!report.getNguoiDung().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        try {
            java.io.File file = new java.io.File(report.getFileUrl().substring(1)); // Bỏ dấu / ở đầu
            java.io.FileInputStream fis = new java.io.FileInputStream(file);
            InputStreamResource resource = new InputStreamResource(fis);

            String contentType = report.getDinhDang().equals("xlsx") 
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                : "application/pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName())
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (java.io.FileNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
