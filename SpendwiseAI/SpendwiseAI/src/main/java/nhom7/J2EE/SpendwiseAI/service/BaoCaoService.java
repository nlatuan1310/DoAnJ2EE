package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.BaoCao;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.BaoCaoRepository;
import nhom7.J2EE.SpendwiseAI.repository.GiaoDichRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BaoCaoService {

    private final GiaoDichRepository giaoDichRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    public ByteArrayInputStream exportExcel(UUID nguoiDungId, LocalDateTime start, LocalDateTime end) {
        List<GiaoDich> transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        
        // Lưu lịch sử
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElse(null);
        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai("monthly")
                .dinhDang("excel")
                .ngayTao(LocalDateTime.now())
                .build();
        baoCaoRepository.save(reportRecord);

        return excelExportService.exportGiaoDichToExcel(transactions);
    }

    public ByteArrayInputStream exportPdf(UUID nguoiDungId, LocalDateTime start, LocalDateTime end) {
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElseThrow(() -> new RuntimeException("User not found"));
        List<GiaoDich> transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        
        // Lưu lịch sử
        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai("monthly")
                .dinhDang("pdf")
                .ngayTao(LocalDateTime.now())
                .build();
        baoCaoRepository.save(reportRecord);

        return pdfExportService.exportExpenseReport(user, transactions, start, end);
    }
}
