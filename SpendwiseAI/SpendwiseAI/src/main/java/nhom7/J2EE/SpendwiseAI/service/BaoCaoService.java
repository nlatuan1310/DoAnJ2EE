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
    private final EmailService emailService;


    private static final String EXPORT_DIR = "reports_export/";

    public ByteArrayInputStream exportExcel(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai, String tenBaoCao, UUID viId) {
        List<GiaoDich> transactions;
        if (viId != null) {
            transactions = giaoDichRepository.findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(nguoiDungId, viId, start, end);
        } else {
            transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        }
        
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElse(null);
        String baseName = (tenBaoCao != null && !tenBaoCao.isBlank()) ? tenBaoCao : "BaoCao_" + (user != null ? user.getHoVaTen() : "User");
        String fileName = baseName + "_" + UUID.randomUUID().toString().substring(0, 8) + ".xlsx";

        ByteArrayInputStream out = excelExportService.exportGiaoDichToExcel(transactions);
        byte[] content = out.readAllBytes();
        
        // Reset the input stream for return
        ByteArrayInputStream outToReturn = new ByteArrayInputStream(content);
        
        // Save to file
        String fileUrl = saveFile(fileName, content);


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


    public ByteArrayInputStream exportPdf(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai, String tenBaoCao, UUID viId) {

        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElseThrow(() -> new RuntimeException("User not found"));
        List<GiaoDich> transactions;
        if (viId != null) {
            transactions = giaoDichRepository.findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(nguoiDungId, viId, start, end);
        } else {
            transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        }
        
        String baseName = (tenBaoCao != null && !tenBaoCao.isBlank()) ? tenBaoCao : "BaoCao_" + user.getHoVaTen();
        String fileName = baseName + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";

        ByteArrayInputStream out = pdfExportService.exportExpenseReport(user, transactions, start, end);
        byte[] content = out.readAllBytes();

        // Reset the input stream for return
        ByteArrayInputStream outToReturn = new ByteArrayInputStream(content);

        // Save to file
        String fileUrl = saveFile(fileName, content);


        // Lưu lịch sử
        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai("monthly")
                .dinhDang("pdf")
                .ngayTao(LocalDateTime.now())
                .build();
        baoCaoRepository.save(reportRecord);

        return outToReturn;
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
        
        String baseName = (tenBaoCao != null && !tenBaoCao.isBlank()) ? tenBaoCao : "SoSanh_" + user.getHoVaTen();
        String fileName = baseName + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";

        ByteArrayInputStream out = pdfExportService.exportComparisonReportPdf(user, t1, t2, start1, end1, start2, end2);
        byte[] content = out.readAllBytes();

        ByteArrayInputStream outToReturn = new ByteArrayInputStream(content);
        String fileUrl = saveFile(fileName, content);

        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai("comparison")
                .dinhDang("pdf")
                .fileUrl(fileUrl)
                .ngayTao(LocalDateTime.now())
                .build();
        baoCaoRepository.save(reportRecord);

        return outToReturn;
    }

    public ByteArrayInputStream exportSingleTransactionPdf(UUID transactionId, UUID nguoiDungId) {
        GiaoDich gd = giaoDichRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));
        if (!gd.getNguoiDung().getId().equals(nguoiDungId)) {
            throw new RuntimeException("Bạn không có quyền xuất giao dịch này");
        }
        
        List<GiaoDich> transactions = List.of(gd);
        NguoiDung user = gd.getNguoiDung();
        
        String baseName = "GiaoDich_" + (gd.getMoTa() != null ? gd.getMoTa().replace(" ", "_") : "Chi_Tiet");
        String fileName = baseName + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";

        ByteArrayInputStream out = pdfExportService.exportExpenseReport(user, transactions, gd.getNgayGiaoDich(), gd.getNgayGiaoDich());
        byte[] content = out.readAllBytes();

        ByteArrayInputStream outToReturn = new ByteArrayInputStream(content);
        String fileUrl = saveFile(fileName, content);

        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai("Single Transaction")
                .dinhDang("pdf")
                .fileUrl(fileUrl)
                .ngayTao(LocalDateTime.now())
                .build();
        baoCaoRepository.save(reportRecord);

        return outToReturn;
    }

    private String saveFile(String fileName, byte[] content) {
        try {
            File directory = new File(EXPORT_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            Path path = Paths.get(EXPORT_DIR + fileName);
            Files.write(path, content);
            return "/" + EXPORT_DIR + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file báo cáo: " + e.getMessage());
        }
    }

    public List<BaoCao> findByNguoiDung(UUID userId) {
        return baoCaoRepository.findByNguoiDungIdOrderByNgayTaoDesc(userId);
    }

    public BaoCao findById(UUID id) {
        return baoCaoRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));

    }

    public void sendReportByEmail(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai, String dinhDang, String tenBaoCao, String emailNhan, String noiDung, UUID viId) {
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        byte[] content;
        String fileName;
        String mimeType;

        if ("xlsx".equalsIgnoreCase(dinhDang)) {
            ByteArrayInputStream in = exportExcel(nguoiDungId, start, end, loai, tenBaoCao, viId);
            content = in.readAllBytes();
            fileName = (tenBaoCao != null && !tenBaoCao.isBlank() ? tenBaoCao : "BaoCao") + ".xlsx";
            mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else {
            ByteArrayInputStream in = exportPdf(nguoiDungId, start, end, loai, tenBaoCao, viId);
            content = in.readAllBytes();
            fileName = (tenBaoCao != null && !tenBaoCao.isBlank() ? tenBaoCao : "BaoCao") + ".pdf";
            mimeType = "application/pdf";
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

    public void deleteReport(UUID id) {
        BaoCao report = findById(id);
        
        // Deleting file
        try {
            Path path = Paths.get(report.getFileUrl().substring(1));
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Không thể xóa file report: " + e.getMessage());
        }

        baoCaoRepository.delete(report);
    }
}
