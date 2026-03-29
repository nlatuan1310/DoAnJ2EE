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
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    private static final String EXPORT_DIR = "reports_export/";

    public ByteArrayInputStream exportExcel(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai) {
        List<GiaoDich> transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElse(null);
        String fileName = "BaoCao_" + (user != null ? user.getHoVaTen() : "User") + "_" + UUID.randomUUID() + ".xlsx";

        ByteArrayInputStream out = excelExportService.exportGiaoDichToExcel(transactions);
        byte[] content = out.readAllBytes();
        
        // Reset the input stream for return
        ByteArrayInputStream outToReturn = new ByteArrayInputStream(content);
        
        // Save to file
        String fileUrl = saveFile(fileName, content);

        // Lưu lịch sử
        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai(loai)
                .dinhDang("xlsx")
                .fileUrl(fileUrl)
                .ngayTao(LocalDateTime.now())
                .build();
        baoCaoRepository.save(reportRecord);

        return outToReturn;
    }

    public ByteArrayInputStream exportPdf(UUID nguoiDungId, LocalDateTime start, LocalDateTime end, String loai) {
        NguoiDung user = nguoiDungRepository.findById(nguoiDungId).orElseThrow(() -> new RuntimeException("User not found"));
        List<GiaoDich> transactions = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(nguoiDungId, start, end);
        
        String fileName = "BaoCao_" + user.getHoVaTen() + "_" + UUID.randomUUID() + ".pdf";

        ByteArrayInputStream out = pdfExportService.exportExpenseReport(user, transactions, start, end);
        byte[] content = out.readAllBytes();

        // Reset the input stream for return
        ByteArrayInputStream outToReturn = new ByteArrayInputStream(content);

        // Save to file
        String fileUrl = saveFile(fileName, content);

        // Lưu lịch sử
        BaoCao reportRecord = BaoCao.builder()
                .nguoiDung(user)
                .loai(loai)
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
}
