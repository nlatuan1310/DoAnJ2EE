package nhom7.J2EE.SpendwiseAI.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PiePlot;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    public ByteArrayInputStream exportExpenseReport(NguoiDung user, List<GiaoDich> giaoDichs, LocalDateTime from, LocalDateTime to) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font định dạng (Sử dụng font mặc định, nếu muốn hiển thị tiếng Việt tốt hơn cần nhúng font Unicode)
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Tiêu đề
            Paragraph title = new Paragraph("BAO CAO TAI CHINH CA NHAN", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" ")); // Dòng trống

            // Thông tin chung
            document.add(new Paragraph("Khach hang: " + user.getHoVaTen(), normalFont));
            document.add(new Paragraph("Email: " + user.getEmail(), normalFont));
            document.add(new Paragraph("Thoi gian: " + from.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " - " + to.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont));
            document.add(new Paragraph("Ngay lap: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), normalFont));

            document.add(new Paragraph(" "));

            // Tính toán thống kê
            BigDecimal totalIncome = giaoDichs.stream()
                    .filter(g -> "income".equalsIgnoreCase(g.getLoai()))
                    .map(GiaoDich::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalExpense = giaoDichs.stream()
                    .filter(g -> "expense".equalsIgnoreCase(g.getLoai()))
                    .map(GiaoDich::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            document.add(new Paragraph("Tong Thu nhap: " + String.format("%,.0f", totalIncome) + " VND", normalFont));
            document.add(new Paragraph("Tong Chi tieu: " + String.format("%,.0f", totalExpense) + " VND", normalFont));
            document.add(new Paragraph("So du trong ky: " + String.format("%,.0f", totalIncome.subtract(totalExpense)) + " VND", normalFont));

            document.add(new Paragraph(" "));

            // --- BIỂU ĐỒ PHÂN BỔ CHI TIÊU ---
            document.add(new Paragraph("1. Bieu do phan bo chi tieu theo danh muc", headerFont));
            document.add(new Paragraph(" "));
            
            byte[] chartImage = createCategoryPieChart(giaoDichs);
            if (chartImage != null) {
                Image img = Image.getInstance(chartImage);
                img.setAlignment(Element.ALIGN_CENTER);
                img.scaleToFit(400, 300);
                document.add(img);
            }

            document.add(new Paragraph(" "));

            // --- BẢNG CHI TIẾT GIAO DỊCH ---
            document.add(new Paragraph("2. Danh sach giao dich chi tiet", headerFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 3, 2, 2, 4});

            // Tiêu đề bảng
            String[] headers = {"STT", "Ngay", "Loai", "So tien", "Noi dung"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            int count = 1;
            for (GiaoDich gd : giaoDichs) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(count++), normalFont)));
                table.addCell(new PdfPCell(new Phrase(gd.getNgayGiaoDich().format(DateTimeFormatter.ofPattern("dd/MM")), normalFont)));
                table.addCell(new PdfPCell(new Phrase(gd.getLoai().equalsIgnoreCase("income") ? "Thu" : "Chi", normalFont)));
                table.addCell(new PdfPCell(new Phrase(String.format("%,.0f", gd.getSoTien()), normalFont)));
                table.addCell(new PdfPCell(new Phrase(gd.getMoTa() != null ? gd.getMoTa() : "", normalFont)));
            }
            document.add(table);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private byte[] createCategoryPieChart(List<GiaoDich> giaoDichs) throws IOException {
        // Lọc giao dịch chi tiêu
        Map<String, Double> categoryData = giaoDichs.stream()
                .filter(g -> "expense".equalsIgnoreCase(g.getLoai()))
                .collect(Collectors.groupingBy(
                        g -> g.getDanhMuc() != null ? g.getDanhMuc().getTen() : "Khac",
                        Collectors.summingDouble(g -> g.getSoTien().doubleValue())
                ));

        if (categoryData.isEmpty()) return null;

        DefaultPieDataset dataset = new DefaultPieDataset();
        categoryData.forEach(dataset::setValue);

        JFreeChart chart = ChartFactory.createPieChart(
                "Phan bo chi tieu", 
                dataset, 
                true, true, false);

        // Tùy chỉnh chart
        PiePlot plot = (PiePlot) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);

        // Render ra ảnh
        BufferedImage bufferedImage = chart.createBufferedImage(500, 400);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "png", baos);
        return baos.toByteArray();
    }
}
