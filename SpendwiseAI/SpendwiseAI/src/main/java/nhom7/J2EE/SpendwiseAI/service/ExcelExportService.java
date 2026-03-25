package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    public ByteArrayInputStream exportGiaoDichToExcel(List<GiaoDich> giaoDichs) {
        String[] columns = {"STT", "Ngày giao dịch", "Loại", "Danh mục", "Số tiền", "Mô tả", "Ví"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("GiaoDich");

            // Font cho Header
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            // Style cho Header
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setBorderBottom(BorderStyle.THIN);
            headerCellStyle.setBorderTop(BorderStyle.THIN);
            headerCellStyle.setBorderLeft(BorderStyle.THIN);
            headerCellStyle.setBorderRight(BorderStyle.THIN);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Row cho Header
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Cell Style cho Currency (Số tiền)
            CellStyle currencyCellStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyCellStyle.setDataFormat(format.getFormat("#,##0"));
            currencyCellStyle.setBorderBottom(BorderStyle.THIN);
            currencyCellStyle.setBorderTop(BorderStyle.THIN);
            currencyCellStyle.setBorderLeft(BorderStyle.THIN);
            currencyCellStyle.setBorderRight(BorderStyle.THIN);

            // Cell Style cho văn bản thông thường
            CellStyle textCellStyle = workbook.createCellStyle();
            textCellStyle.setBorderBottom(BorderStyle.THIN);
            textCellStyle.setBorderTop(BorderStyle.THIN);
            textCellStyle.setBorderLeft(BorderStyle.THIN);
            textCellStyle.setBorderRight(BorderStyle.THIN);

            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (GiaoDich gd : giaoDichs) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(rowIdx - 1);
                row.getCell(0).setCellStyle(textCellStyle);

                row.createCell(1).setCellValue(gd.getNgayGiaoDich().format(formatter));
                row.getCell(1).setCellStyle(textCellStyle);

                row.createCell(2).setCellValue(gd.getLoai().equalsIgnoreCase("income") ? "Thu nhập" : "Chi tiêu");
                row.getCell(2).setCellStyle(textCellStyle);

                row.createCell(3).setCellValue(gd.getDanhMuc() != null ? gd.getDanhMuc().getTen() : "Không có");
                row.getCell(3).setCellStyle(textCellStyle);

                Cell amountCell = row.createCell(4);
                amountCell.setCellValue(gd.getSoTien().doubleValue());
                amountCell.setCellStyle(currencyCellStyle);

                row.createCell(5).setCellValue(gd.getMoTa() != null ? gd.getMoTa() : "");
                row.getCell(5).setCellStyle(textCellStyle);

                row.createCell(6).setCellValue(gd.getViTien() != null ? gd.getViTien().getTenVi() : "N/A");
                row.getCell(6).setCellStyle(textCellStyle);
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo file Excel: " + e.getMessage());
        }
    }
}
