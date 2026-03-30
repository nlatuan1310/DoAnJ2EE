package nhom7.J2EE.SpendwiseAI.controller;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.service.BaoCaoService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
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
            @RequestParam(defaultValue = "monthly") String loai,
            @RequestParam(required = false) String tenBaoCao,
            @RequestParam(required = false) UUID viId) {

        NguoiDung user = getCurrentUser();
        ByteArrayInputStream out = baoCaoService.exportExcel(user.getId(), start, end, loai, tenBaoCao, viId);

        String fileName = (tenBaoCao != null && !tenBaoCao.isBlank()) ? tenBaoCao : "BaoCao_" + user.getHoVaTen();
        if(!fileName.endsWith(".xlsx")) fileName += ".xlsx";


        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + fileName);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(out));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<InputStreamResource> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "monthly") String loai,
            @RequestParam(required = false) String tenBaoCao,
            @RequestParam(required = false) UUID viId) {

        NguoiDung user = getCurrentUser();
        ByteArrayInputStream out = baoCaoService.exportPdf(user.getId(), start, end, loai, tenBaoCao, viId);

        String fileName = (tenBaoCao != null && !tenBaoCao.isBlank()) ? tenBaoCao : "BaoCao_" + user.getHoVaTen();
        if(!fileName.endsWith(".pdf")) fileName += ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + fileName);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(out));
    }

    @GetMapping("/export/comparison/pdf")
    public ResponseEntity<InputStreamResource> exportComparisonPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start2,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end2,
            @RequestParam(required = false) String tenBaoCao,
            @RequestParam(required = false) UUID viId) {

        NguoiDung user = getCurrentUser();
        ByteArrayInputStream out = baoCaoService.exportComparisonPdf(user.getId(), start1, end1, start2, end2, tenBaoCao, viId);

        String fileName = (tenBaoCao != null && !tenBaoCao.isBlank()) ? tenBaoCao : "BaoCao_SoSanh_" + user.getHoVaTen();
        if(!fileName.endsWith(".pdf")) fileName += ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + fileName);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(out));
    }




    @GetMapping("/export/email")
    public ResponseEntity<Void> sendEmailReport(
            @RequestParam("start") LocalDateTime start,
            @RequestParam("end") LocalDateTime end,
            @RequestParam("loai") String loai,
            @RequestParam("format") String format,
            @RequestParam(value = "tenBaoCao", required = false) String tenBaoCao,
            @RequestParam(value = "emailNhan", required = false) String emailNhan,
            @RequestParam(value = "noiDung", required = false) String noiDung,
            @RequestParam(required = false) UUID viId) {
        NguoiDung user = getCurrentUser();
        baoCaoService.sendReportByEmail(user.getId(), start, end, loai, format, tenBaoCao, emailNhan, noiDung, viId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export/transaction/{id}")
    public ResponseEntity<InputStreamResource> exportSingleTransaction(@PathVariable UUID id) {
        NguoiDung user = getCurrentUser();
        ByteArrayInputStream out = baoCaoService.exportSingleTransactionPdf(id, user.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=GiaoDich_Detail.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(out));
    }

    @GetMapping("/export/transaction/{id}/email")
    public ResponseEntity<Void> sendEmailSingleTransaction(
            @PathVariable UUID id,
            @RequestParam(value = "emailNhan", required = false) String emailNhan,
            @RequestParam(value = "noiDung", required = false) String noiDung) {
        NguoiDung user = getCurrentUser();
        baoCaoService.sendSingleTransactionByEmail(id, user.getId(), emailNhan, noiDung);
        return ResponseEntity.ok().build();
    }

}
