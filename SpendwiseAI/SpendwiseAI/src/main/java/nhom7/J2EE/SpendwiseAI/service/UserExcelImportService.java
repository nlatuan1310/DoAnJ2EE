package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserExcelImportService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final NhatKyAdminService nhatKyAdminService;

    public UserExcelImportService(NguoiDungRepository nguoiDungRepository, PasswordEncoder passwordEncoder, NhatKyAdminService nhatKyAdminService) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
        this.nhatKyAdminService = nhatKyAdminService;
    }

    public Map<String, Object> importUsersFromExcel(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<NguoiDung> importedUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        if (file.isEmpty()) {
            result.put("success", false);
            result.put("message", "File is empty");
            return result;
        }

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            String defaultPasswordHash = passwordEncoder.encode("SpendWise@2026");

            for (Row row : sheet) {
                // Skip header row
                if (row.getRowNum() == 0) continue;

                try {
                    String email = getCellValueAsString(row.getCell(0));
                    if (email == null || email.trim().isEmpty()) continue;

                    if (nguoiDungRepository.existsByEmail(email)) {
                        errors.add("Row " + (row.getRowNum() + 1) + ": Email " + email + " already exists.");
                        continue;
                    }

                    String hoVaTen = getCellValueAsString(row.getCell(1));
                    String dienThoai = getCellValueAsString(row.getCell(2));
                    String vaiTroRaw = getCellValueAsString(row.getCell(3));
                    String vaiTro = (vaiTroRaw != null && vaiTroRaw.trim().equalsIgnoreCase("admin")) ? "admin" : "user";

                    NguoiDung user = NguoiDung.builder()
                            .email(email)
                            .hoVaTen(hoVaTen)
                            .dienThoai(dienThoai)
                            .vaiTro(vaiTro)
                            .matKhauHash(defaultPasswordHash)
                            .trangThai(true)
                            .tienTe("VND")
                            .twoFactorEnabled(false)
                            .build();

                    importedUsers.add(user);

                } catch (Exception ex) {
                    errors.add("Row " + (row.getRowNum() + 1) + ": Format error - " + ex.getMessage());
                }
            }

            if (!importedUsers.isEmpty()) {
                nguoiDungRepository.saveAll(importedUsers);
                nhatKyAdminService.ghiNhatKy("IMPORT_EXCEL_" + importedUsers.size() + "_USERS", "nguoi_dung", null);
            }

            result.put("success", true);
            result.put("importedCount", importedUsers.size());
            result.put("errors", errors);
            result.put("message", "Import process completed");

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error parsing Excel file: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }
}
