package nhom7.J2EE.SpendwiseAI.controller;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.dto.ThongKeDTO;
import nhom7.J2EE.SpendwiseAI.service.ThongKeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/thong-ke")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    @GetMapping("/category")
    public ResponseEntity<List<ThongKeDTO.CategorySummary>> getByCategoryID(
            @RequestParam UUID nguoiDungId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(thongKeService.thongKeTheoDanhMuc(nguoiDungId, start, end));
    }

    @GetMapping("/tag")
    public ResponseEntity<List<ThongKeDTO.TagSummary>> getByTag(
            @RequestParam UUID nguoiDungId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(thongKeService.thongKeTheoTag(nguoiDungId, start, end));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<Object[]>> getTrend(
            @RequestParam UUID nguoiDungId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(thongKeService.thongKeTheoNgay(nguoiDungId, start, end));
    }
}
