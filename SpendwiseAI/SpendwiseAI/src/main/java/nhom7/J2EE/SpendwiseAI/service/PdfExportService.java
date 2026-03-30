package nhom7.J2EE.SpendwiseAI.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
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

            // Nhúng font Tiếng Việt (Sử dụng Arial có sẵn trên Windows)
            String fontPath = "C:/Windows/Fonts/arial.ttf";
            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font titleFont = new Font(bf, 22, Font.BOLD, new Color(79, 70, 229)); // Indigo-600
            Font headerFont = new Font(bf, 13, Font.BOLD, Color.DARK_GRAY);
            Font normalFont = new Font(bf, 10, Font.NORMAL, Color.BLACK);
            Font smallFont = new Font(bf, 8, Font.NORMAL, Color.GRAY);

            // 1. Header & Title
            Paragraph title = new Paragraph("BÁO CÁO TÀI CHÍNH CÁ NHÂN", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // 2. Thông tin khách hàng & Thời gian (Grid 2 cột)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            
            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("Khách hàng: " + user.getHoVaTen(), headerFont));
            leftHeader.addElement(new Paragraph("Email: " + user.getEmail(), normalFont));
            infoTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph datePara = new Paragraph("Kỳ báo cáo: " + from.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " - " + to.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(datePara);
            Paragraph createdPara = new Paragraph("Ngày lập: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), smallFont);
            createdPara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(createdPara);
            infoTable.addCell(rightHeader);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // 3. Tính toán thống kê & Summary Cards
            BigDecimal totalIncome = giaoDichs.stream()
                    .filter(g -> "income".equalsIgnoreCase(g.getLoai()))
                    .map(GiaoDich::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalExpense = giaoDichs.stream()
                    .filter(g -> "expense".equalsIgnoreCase(g.getLoai()))
                    .map(GiaoDich::getSoTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            PdfPTable summaryTable = new PdfPTable(3);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(10);
            summaryTable.setSpacingAfter(20);

            addSummaryCell(summaryTable, "TỔNG THU NHẬP", totalIncome, new Color(236, 253, 245), new Color(5, 150, 105), bf);
            addSummaryCell(summaryTable, "TỔNG CHI TIÊU", totalExpense, new Color(254, 242, 242), new Color(220, 38, 38), bf);
            addSummaryCell(summaryTable, "SỐ DƯ CUỐI KỲ", totalIncome.subtract(totalExpense), new Color(239, 246, 255), new Color(37, 99, 235), bf);

            document.add(summaryTable);

            // 4. Biểu đồ phẩn bổ chi tiêu
            document.add(new Paragraph("1. Biểu đồ phân bổ chi tiêu theo danh mục", headerFont));
            document.add(new Paragraph(" "));
            
            byte[] chartImage = createCategoryPieChart(giaoDichs);
            if (chartImage != null) {
                Image img = Image.getInstance(chartImage);
                img.setAlignment(Element.ALIGN_CENTER);
                img.scaleToFit(380, 280);
                document.add(img);
            } else {
                document.add(new Paragraph("Không có dữ liệu chi tiêu để hiển thị biểu đồ.", normalFont));
            }

            document.add(new Paragraph(" "));

            // 5. Danh sách giao dịch chi tiết
            document.add(new Paragraph("2. Danh sách giao dịch chi tiết", headerFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 2, 2, 4, 5});
            table.setHeaderRows(1);

            // Tiêu đề bảng
            String[] headers = {"STT", "Ngày", "Loại", "Số tiền (VND)", "Ghi chú"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, new Font(bf, 10, Font.BOLD, Color.WHITE)));
                cell.setBackgroundColor(new Color(30, 41, 59)); // Slate-800
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            int count = 1;
            for (GiaoDich gd : giaoDichs) {
                PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(count++), normalFont));
                c1.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(c1);

                table.addCell(new PdfPCell(new Phrase(gd.getNgayGiaoDich().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont)));
                
                String behavior = gd.getLoai().equalsIgnoreCase("income") ? "Thu nhập" : "Chi tiêu";
                Font behaviorFont = new Font(bf, 10, Font.NORMAL, gd.getLoai().equalsIgnoreCase("income") ? new Color(5, 150, 105) : new Color(220, 38, 38));
                table.addCell(new PdfPCell(new Phrase(behavior, behaviorFont)));

                PdfPCell amountCell = new PdfPCell(new Phrase(String.format("%,.0f", gd.getSoTien()), normalFont));
                amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(amountCell);

                table.addCell(new PdfPCell(new Phrase(gd.getMoTa() != null ? gd.getMoTa() : "-", normalFont)));
            }
            document.add(table);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addSummaryCell(PdfPTable table, String label, BigDecimal value, Color bgColor, Color textColor, BaseFont bf) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bgColor);
        cell.setPadding(10);
        cell.setBorderColor(Color.WHITE);
        cell.setBorderWidth(2);

        Paragraph pLabel = new Paragraph(label, new Font(bf, 8, Font.BOLD, Color.GRAY));
        pLabel.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pLabel);

        Paragraph pValue = new Paragraph(String.format("%,.0f", value), new Font(bf, 12, Font.BOLD, textColor));
        pValue.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pValue);

        table.addCell(cell);
    }

    private byte[] createCategoryPieChart(List<GiaoDich> giaoDichs) throws IOException {
        // Lọc giao dịch chi tiêu
        Map<String, Double> categoryData = giaoDichs.stream()
                .filter(g -> "expense".equalsIgnoreCase(g.getLoai()))
                .collect(Collectors.groupingBy(
                        g -> g.getDanhMuc() != null ? g.getDanhMuc().getTenDanhMuc() : "Khac",
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

    public ByteArrayInputStream exportComparisonReportPdf(NguoiDung user, List<GiaoDich> p1Docs, List<GiaoDich> p2Docs, LocalDateTime from1, LocalDateTime to1, LocalDateTime from2, LocalDateTime to2) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            String fontPath = "C:/Windows/Fonts/arial.ttf";
            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font titleFont = new Font(bf, 22, Font.BOLD, new Color(79, 70, 229));
            Font headerFont = new Font(bf, 13, Font.BOLD, Color.DARK_GRAY);
            Font normalFont = new Font(bf, 10, Font.NORMAL, Color.BLACK);
            Font smallFont = new Font(bf, 8, Font.NORMAL, Color.GRAY);

            Paragraph title = new Paragraph("BÁO CÁO SO SÁNH TÀI CHÍNH", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            
            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("Khách hàng: " + user.getHoVaTen(), headerFont));
            leftHeader.addElement(new Paragraph("Email: " + user.getEmail(), normalFont));
            infoTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph p1Date = new Paragraph("Kỳ 1: " + from1.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " - " + to1.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
            p1Date.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(p1Date);
            Paragraph p2Date = new Paragraph("Kỳ 2: " + from2.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " - " + to2.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont);
            p2Date.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(p2Date);
            
            infoTable.addCell(rightHeader);
            document.add(infoTable);
            document.add(new Paragraph(" "));

            BigDecimal p1Inc = p1Docs.stream().filter(g -> "income".equalsIgnoreCase(g.getLoai())).map(GiaoDich::getSoTien).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal p1Exp = p1Docs.stream().filter(g -> "expense".equalsIgnoreCase(g.getLoai())).map(GiaoDich::getSoTien).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal p2Inc = p2Docs.stream().filter(g -> "income".equalsIgnoreCase(g.getLoai())).map(GiaoDich::getSoTien).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal p2Exp = p2Docs.stream().filter(g -> "expense".equalsIgnoreCase(g.getLoai())).map(GiaoDich::getSoTien).reduce(BigDecimal.ZERO, BigDecimal::add);

            document.add(new Paragraph("1. So sánh tổng quan", headerFont));
            document.add(new Paragraph(" "));
            
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 2, 2, 2});
            
            String[] headersArr = {"Chỉ tiêu", "Kỳ 1 (VND)", "Kỳ 2 (VND)", "Chênh lệch"};
            for (String h : headersArr) {
                PdfPCell cell = new PdfPCell(new Phrase(h, new Font(bf, 10, Font.BOLD, Color.WHITE)));
                cell.setBackgroundColor(new Color(30, 41, 59));
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            addComparisonRow(table, "Tổng thu nhập", p1Inc, p2Inc, normalFont);
            addComparisonRow(table, "Tổng chi tiêu", p1Exp, p2Exp, normalFont);
            addComparisonRow(table, "Số dư", p1Inc.subtract(p1Exp), p2Inc.subtract(p2Exp), normalFont);
            
            document.add(table);
            document.add(new Paragraph(" "));
            
            document.add(new Paragraph("2. Chi tiết theo danh mục (Chi tiêu)", headerFont));
            document.add(new Paragraph(" "));
            
            Map<String, BigDecimal> p1Cat = p1Docs.stream().filter(g -> "expense".equalsIgnoreCase(g.getLoai())).collect(Collectors.groupingBy(g -> g.getDanhMuc() != null ? g.getDanhMuc().getTenDanhMuc() : "Khác", Collectors.reducing(BigDecimal.ZERO, GiaoDich::getSoTien, BigDecimal::add)));
            Map<String, BigDecimal> p2Cat = p2Docs.stream().filter(g -> "expense".equalsIgnoreCase(g.getLoai())).collect(Collectors.groupingBy(g -> g.getDanhMuc() != null ? g.getDanhMuc().getTenDanhMuc() : "Khác", Collectors.reducing(BigDecimal.ZERO, GiaoDich::getSoTien, BigDecimal::add)));
            
            PdfPTable catTable = new PdfPTable(4);
            catTable.setWidthPercentage(100);
            catTable.setWidths(new float[]{3, 2, 2, 2});
            for (String h : new String[]{"Danh mục", "Kỳ 1 (VND)", "Kỳ 2 (VND)", "Chênh lệch"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, new Font(bf, 10, Font.BOLD, Color.WHITE)));
                cell.setBackgroundColor(new Color(30, 41, 59));
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                catTable.addCell(cell);
            }
            
            for (String cat : p2Cat.keySet()) {
                BigDecimal v1 = p1Cat.getOrDefault(cat, BigDecimal.ZERO);
                BigDecimal v2 = p2Cat.get(cat);
                addComparisonRow(catTable, cat, v1, v2, normalFont);
            }
            
            for (String cat : p1Cat.keySet()) {
                if (!p2Cat.containsKey(cat)) {
                    BigDecimal v1 = p1Cat.get(cat);
                    BigDecimal v2 = BigDecimal.ZERO;
                    addComparisonRow(catTable, cat, v1, v2, normalFont);
                }
            }
            
            document.add(catTable);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo file PDF so sánh: " + e.getMessage());
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addComparisonRow(PdfPTable table, String label, BigDecimal v1, BigDecimal v2, Font font) {
        table.addCell(new PdfPCell(new Phrase(label, font)));
        PdfPCell c1 = new PdfPCell(new Phrase(String.format("%,.0f", v1), font));
        c1.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c1);
        PdfPCell c2 = new PdfPCell(new Phrase(String.format("%,.0f", v2), font));
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c2);
        
        BigDecimal diff = v2.subtract(v1);
        String diffStr = (diff.compareTo(BigDecimal.ZERO) > 0 ? "+" : "") + String.format("%,.0f", diff);
        Font diffFont = new Font(font);
        if (diff.compareTo(BigDecimal.ZERO) > 0) {
            diffFont.setColor(new Color(220, 38, 38)); // Red if expense increased (assume worse). If income, it's context dependent. For simplicity, just red for + and green for -
        } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
            diffFont.setColor(new Color(5, 150, 105));
        }
        PdfPCell cDiff = new PdfPCell(new Phrase(diffStr, diffFont));
        cDiff.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cDiff);
    }
}
