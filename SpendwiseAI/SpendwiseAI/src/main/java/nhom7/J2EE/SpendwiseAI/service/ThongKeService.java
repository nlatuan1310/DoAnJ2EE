package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.repository.GiaoDichRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class ThongKeService {

    private final NguoiDungRepository nguoiDungRepository;
    private final GiaoDichRepository giaoDichRepository;

    public ThongKeService(NguoiDungRepository nguoiDungRepository, GiaoDichRepository giaoDichRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.giaoDichRepository = giaoDichRepository;
    }

    public Map<String, Object> layThongKeTongQuan() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = nguoiDungRepository.count();
        long totalTransactions = giaoDichRepository.count();
        BigDecimal totalRevenue = giaoDichRepository.tinhTongTienGiaoDich();
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        java.time.LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        java.time.LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        // Tính người dùng
        long usersThisMonth = nguoiDungRepository.countByNgayTaoBetween(startOfMonth, now);
        long usersLastMonth = nguoiDungRepository.countByNgayTaoBetween(startOfLastMonth, endOfLastMonth);
        double userGrowth = usersLastMonth == 0 ? (usersThisMonth > 0 ? 100.0 : 0.0) : ((double)(usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

        // Tính giao dịch
        long txThisMonth = giaoDichRepository.countByNgayGiaoDichBetween(startOfMonth, now);
        long txLastMonth = giaoDichRepository.countByNgayGiaoDichBetween(startOfLastMonth, endOfLastMonth);
        double txGrowth = txLastMonth == 0 ? (txThisMonth > 0 ? 100.0 : 0.0) : ((double)(txThisMonth - txLastMonth) / txLastMonth) * 100;

        // Tính người dùng active theo tuần (dựa trên số lượng user phân biệt có tương tác giao dịch)
        java.time.LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0);
        java.time.LocalDateTime startOfLastWeek = startOfWeek.minusWeeks(1);
        long activeThisWeek = giaoDichRepository.countActiveUsers(startOfWeek, now);
        long activeLastWeek = giaoDichRepository.countActiveUsers(startOfLastWeek, startOfWeek.minusSeconds(1));
        double activeGrowth = activeLastWeek == 0 ? (activeThisWeek > 0 ? 100.0 : 0.0) : ((double)(activeThisWeek - activeLastWeek) / activeLastWeek) * 100;

        // Thống kê cơ bản
        stats.put("tongNguoiDung", totalUsers);
        stats.put("tongNguoiDungTangTruong", Math.round(userGrowth * 10.0) / 10.0);
        
        stats.put("tongGiaoDich", totalTransactions);
        stats.put("tongGiaoDichTangTruong", Math.round(txGrowth * 10.0) / 10.0);
        
        stats.put("tongLuanChuyen", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Thống kê theo số liệu thực, không dùng mock 80%
        stats.put("nguoiDungActive", activeThisWeek);
        stats.put("nguoiDungActiveTangTruong", Math.round(activeGrowth * 10.0) / 10.0);
        
        // Dữ liệu biểu đồ Doanh thu 6 tháng gần nhất
        java.util.List<Map<String, Object>> doanhThuTheoThang = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDateTime curMonthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            java.time.LocalDateTime curMonthEnd = curMonthStart.plusMonths(1).minusSeconds(1);
            BigDecimal sum = giaoDichRepository.tinhTongTienGiaoDichKhoang(curMonthStart, curMonthEnd);
            doanhThuTheoThang.add(Map.of(
                "name", "Tháng " + curMonthStart.getMonthValue(),
                "value", sum != null ? sum : BigDecimal.ZERO
            ));
        }
        stats.put("doanhThuTheoThang", doanhThuTheoThang);

        // Dữ liệu biểu đồ Tăng trưởng 7 ngày gần nhất
        java.util.List<Map<String, Object>> tangTruongUser = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime curDayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0).withNano(0);
            java.time.LocalDateTime curDayEnd = curDayStart.plusDays(1).minusSeconds(1);
            
            long newUserCount = nguoiDungRepository.countByNgayTaoBetween(curDayStart, curDayEnd);
            long activeUserCount = giaoDichRepository.countActiveUsers(curDayStart, curDayEnd);
            
            int dayOfWeek = curDayStart.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
            String dayName = dayOfWeek == 7 ? "CN" : "T" + (dayOfWeek + 1);
            
            tangTruongUser.add(Map.of(
                "name", dayName,
                "new", newUserCount,
                "active", activeUserCount
            ));
        }
        stats.put("tangTruongUser", tangTruongUser);
        
        return stats;
    }
}
