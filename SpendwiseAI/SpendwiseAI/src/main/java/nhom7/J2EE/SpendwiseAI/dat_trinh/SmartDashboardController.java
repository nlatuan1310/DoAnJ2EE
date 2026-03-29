package nhom7.J2EE.SpendwiseAI.dat_trinh;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/smart")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép Frontend truy cập
public class SmartDashboardController {

    @GetMapping("/forecast")
    public Map<String, Object> getForecastData() {
        // Giả sử lấy dữ liệu mẫu (Sau này Đạt sẽ lấy từ Repository)
        double totalSpent = 1500000; 
        double budgetLimit = 2000000;
        int currentDay = LocalDate.now().getDayOfMonth(); // Hôm nay ngày 24
        int totalDaysInMonth = LocalDate.now().lengthOfMonth(); // 31 ngày

        // Thuật toán dự báo: (Tiêu TB mỗi ngày) * (Tổng ngày trong tháng)
        double forecastEndMonth = (totalSpent / currentDay) * totalDaysInMonth;

        Map<String, Object> response = new HashMap<>();
        response.put("currentSpent", totalSpent);
        response.put("budgetLimit", budgetLimit);
        response.put("forecast", Math.round(forecastEndMonth));
        response.put("message", forecastEndMonth > budgetLimit ? "Cảnh báo: Bạn có thể vượt ngân sách!" : "Ngân sách vẫn ổn định");

        return response;
    }

    @GetMapping("/subscriptions")
    public List<Map<String, Object>> getSubscriptions() {
        List<Map<String, Object>> subs = new ArrayList<>();
        
        // Giả lập dữ liệu hóa đơn (Sau này Đạt có thể gọi từ Database)
        subs.add(createSub("1", "Netflix", 260000, "2026-03-26", "Entertainment"));
        subs.add(createSub("2", "Spotify Family", 59000, "2026-04-01", "Music"));
        subs.add(createSub("3", "Tiền Mạng VNPT", 220000, "2026-03-28", "Utilities"));

        return subs;
    }

    private Map<String, Object> createSub(String id, String name, double price, String dueDate, String category) {
        Map<String, Object> sub = new HashMap<>();
        sub.put("id", id);
        sub.put("name", name);
        sub.put("price", price);
        sub.put("dueDate", dueDate);
        sub.put("category", category);
        
        // Logic tính ngày còn lại (Nghiệp vụ nhắc hẹn)
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(dueDate));
        sub.put("daysLeft", daysLeft);
        sub.put("status", daysLeft <= 2 ? "Sắp đến hạn" : "Đang theo dõi");
        
        return sub;
    }

    @GetMapping("/alerts")
    public List<Map<String, String>> getSmartAlerts() {
        List<Map<String, String>> alerts = new ArrayList<>();
        
        // 1. Giả lập check 80% ngân sách (Nghiệp vụ 10)
        double spent = 1500000;
        double budget = 2000000;
        if (spent / budget >= 0.75) { // Đạt đang ở mức 75% như trong ảnh
            alerts.add(createAlert("Warning", "Ngân sách tháng 3 đã dùng 75%. Hãy cân nhắc chi tiêu!"));
        }

        // 2. Check hóa đơn sắp đến hạn (Kết hợp Task 6)
        alerts.add(createAlert("Info", "Hóa đơn Netflix sẽ hết hạn sau 2 ngày nữa."));

        // 3. Phát hiện giao dịch bất thường (Giả lập)
        alerts.add(createAlert("Danger", "Phát hiện giao dịch 5.000.000đ bất thường tại Store XYZ."));

        return alerts;
    }

    private Map<String, String> createAlert(String type, String message) {
        Map<String, String> alert = new HashMap<>();
        alert.put("type", type);
        alert.put("message", message);
        return alert;
    }
}
