package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BaoCaoScheduledTask {

    private final NguoiDungRepository nguoiDungRepository;
    private final BaoCaoService baoCaoService;

    /**
     * Tự động gửi báo cáo vào ngày 1 hàng tháng lúc 00:00 (Cron: 0 0 0 1 * ?)
     * Để test dễ hơn có thể dùng: "0 0/1 * * * ?" (mỗi phút một lần)
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    public void tuDongGuiBaoCaoHangThang() {
        LocalDateTime now = LocalDateTime.now();
        
        // Lấy khoảng thời gian của tháng trước đó
        LocalDateTime startOfLastMonth = now.minusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfLastMonth = now.withDayOfMonth(1).minusSeconds(1);

        List<NguoiDung> users = nguoiDungRepository.findByIsScheduledReportsEnabledTrue();

        for (NguoiDung user : users) {
             try {
                 String email = (user.getScheduledReportEmail() != null && !user.getScheduledReportEmail().isBlank()) 
                                ? user.getScheduledReportEmail() : user.getEmail();
                 
                 String tenBaoCao = "BaoCao_DinhKy_" + startOfLastMonth.getMonthValue() + "_" + startOfLastMonth.getYear();
                 String customMessage = "Chào " + user.getHoVaTen() + ", đây là báo cáo tài chính hàng tháng tự động của bạn.";

                 baoCaoService.sendReportByEmail(
                     user.getId(), 
                     startOfLastMonth, 
                     endOfLastMonth, 
                     "Monthly Scheduled", 
                     "pdf", 
                     tenBaoCao, 
                     email, 
                     customMessage,
                     null
                 );
                 System.out.println("Đã gửi báo cáo định kỳ thành công cho: " + user.getEmail());
             } catch (Exception e) {
                 System.err.println("Lỗi khi gửi báo cáo định kỳ cho " + user.getEmail() + ": " + e.getMessage());
             }
        }
    }
}
