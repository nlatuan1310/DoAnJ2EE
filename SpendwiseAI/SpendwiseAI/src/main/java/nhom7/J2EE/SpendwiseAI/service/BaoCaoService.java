package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.repository.GiaoDichRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BaoCaoService {

    private final GiaoDichRepository giaoDichRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;
    private final EmailService emailService;

    public ByteArrayInputStream exportExcel(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai, String tenBaoCao, UUID viId) {
        List<GiaoDich> transactions;
        if (viId != null) {
            transactions = giaoDichRepository.findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(nguoiDungId, viId, start, end);
        } else {
            transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        }
        
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElse(null);
        return excelExportService.exportGiaoDichToExcel(transactions);
    }

    public ByteArrayInputStream exportPdf(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai, String tenBaoCao, UUID viId) {
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElseThrow(() -> new RuntimeException("User not found"));
        List<GiaoDich> transactions;
        if (viId != null) {
            transactions = giaoDichRepository.findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(nguoiDungId, viId, start, end);
        } else {
            transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        }
        
        return pdfExportService.exportExpenseReport(user, transactions, start, end);
    }

    public ByteArrayInputStream exportComparisonPdf(UUID nguoiDungId, LocalDateTime start1, LocalDateTime end1, LocalDateTime start2, LocalDateTime end2, String tenBaoCao, UUID viId) {
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElseThrow(() -> new RuntimeException("User not found"));
        List<GiaoDich> t1;
        List<GiaoDich> t2;
        if (viId != null) {
            t1 = giaoDichRepository.findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(nguoiDungId, viId, start1, end1);
            t2 = giaoDichRepository.findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(nguoiDungId, viId, start2, end2);
        } else {
            t1 = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start1, end1);
            t2 = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start2, end2);
        }
        
        return pdfExportService.exportComparisonReportPdf(user, t1, t2, start1, end1, start2, end2);
    }

    public ByteArrayInputStream exportSingleTransactionPdf(UUID transactionId, UUID nguoiDungId) {
        GiaoDich gd = giaoDichRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));
        if (!gd.getNguoiDung().getId().equals(nguoiDungId)) {
            throw new RuntimeException("Bạn không có quyền xuất giao dịch này");
        }
        
        List<GiaoDich> transactions = List.of(gd);
        NguoiDung user = gd.getNguoiDung();
        
        return pdfExportService.exportExpenseReport(user, transactions, gd.getNgayGiaoDich(), gd.getNgayGiaoDich());
    }



    public void sendReportByEmail(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai, String dinhDang, String tenBaoCao, String emailNhan, String noiDung, UUID viId) {
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        byte[] content;
        String fileName;

        if ("xlsx".equalsIgnoreCase(dinhDang)) {
            ByteArrayInputStream in = exportExcel(nguoiDungId, start, end, loai, tenBaoCao, viId);
            content = in.readAllBytes();
            fileName = (tenBaoCao != null && !tenBaoCao.isBlank() ? tenBaoCao : "BaoCao") + ".xlsx";
        } else {
            ByteArrayInputStream in = exportPdf(nguoiDungId, start, end, loai, tenBaoCao, viId);
            content = in.readAllBytes();
            fileName = (tenBaoCao != null && !tenBaoCao.isBlank() ? tenBaoCao : "BaoCao") + ".pdf";
        }

        String recipient = (emailNhan != null && !emailNhan.isBlank()) ? emailNhan : user.getEmail();
        String subject = "Báo cáo tài chính Spendwise AI - " + (loai != null ? loai : "Custom");
        String text = "<h3>Chào bạn,</h3>" +
                      "<p><b>" + user.getHoVaTen() + "</b> đã chia sẻ báo cáo tài chính từ ngày <b>" + start.toLocalDate() + "</b> đến <b>" + end.toLocalDate() + "</b> tới bạn.</p>" +
                      (noiDung != null && !noiDung.isBlank() ? "<div style='padding: 10px; background: #f3f4f6; border-left: 4px solid #6366f1;'>\"" + noiDung + "\"</div>" : "") +
                      "<p>Vui lòng xem chi tiết trong file đính kèm dưới đây.</p>" +
                      "<br/><p>Trân trọng,<br/>Đội ngũ Spendwise AI</p>";

        emailService.guiEmailVoiDinhKem(recipient, subject, text, fileName, content);
    }

    public void sendSingleTransactionByEmail(UUID transactionId, UUID nguoiDungId, String emailNhan, String noiDung) {
        GiaoDich gd = giaoDichRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));
        if (!gd.getNguoiDung().getId().equals(nguoiDungId)) {
            throw new RuntimeException("Bạn không có quyền xuất giao dịch này");
        }
        
        NguoiDung user = gd.getNguoiDung();
        ByteArrayInputStream in = exportSingleTransactionPdf(transactionId, nguoiDungId);
        byte[] content = in.readAllBytes();
        
        String fileName = "GiaoDich_" + (gd.getMoTa() != null ? gd.getMoTa().replace(" ", "_") : "Chi_Tiet") + ".pdf";
        String recipient = (emailNhan != null && !emailNhan.isBlank()) ? emailNhan : user.getEmail();
        
        String subject = "Biên lai giao dịch Spendwise AI - " + (gd.getMoTa() != null ? gd.getMoTa() : "Chi tiết");
        String text = "<h3>Chào bạn,</h3>" +
                      "<p><b>" + user.getHoVaTen() + "</b> đã chia sẻ biên lai giao dịch tới bạn.</p>" +
                      (noiDung != null && !noiDung.isBlank() ? "<div style='padding: 10px; background: #f3f4f6; border-left: 4px solid #6366f1;'>\"" + noiDung + "\"</div>" : "") +
                      "<p>Vui lòng xem chi tiết biên lai đính kèm.</p>" +
                      "<br/><p>Trân trọng,<br/>Đội ngũ Spendwise AI</p>";

        emailService.guiEmailVoiDinhKem(recipient, subject, text, fileName, content);
    }


}
