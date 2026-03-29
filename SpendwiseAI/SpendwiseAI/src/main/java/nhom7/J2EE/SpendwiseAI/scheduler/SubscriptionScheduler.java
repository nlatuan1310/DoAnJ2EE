package nhom7.J2EE.SpendwiseAI.scheduler;

import nhom7.J2EE.SpendwiseAI.entity.DangKyDichVu;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import nhom7.J2EE.SpendwiseAI.repository.DangKyDichVuRepository;
import nhom7.J2EE.SpendwiseAI.service.GiaoDichService;
import nhom7.J2EE.SpendwiseAI.service.ThongBaoService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class SubscriptionScheduler {

    private final DangKyDichVuRepository dangKyDichVuRepository;
    private final GiaoDichService giaoDichService;
    private final ThongBaoService thongBaoService;

    public SubscriptionScheduler(DangKyDichVuRepository dangKyDichVuRepository,
                                 GiaoDichService giaoDichService,
                                 ThongBaoService thongBaoService) {
        this.dangKyDichVuRepository = dangKyDichVuRepository;
        this.giaoDichService = giaoDichService;
        this.thongBaoService = thongBaoService;
    }

    @Scheduled(cron = "0 0 0 * * *") // Chạy vào lúc 00:00 mỗi ngày
    @Transactional
    public void processSubscriptions() {
        LocalDate today = LocalDate.now();
        // Lấy các dịch vụ đến hạn hôm nay hoặc đã quá hạn mà chưa xử lý
        List<DangKyDichVu> dueSubscriptions = dangKyDichVuRepository.findByNgayThanhToanTiepBefore(today.plusDays(1));

        for (DangKyDichVu subscription : dueSubscriptions) {
            processSingleSubscription(subscription);
        }
    }

    private void processSingleSubscription(DangKyDichVu subscription) {
        // 1. Tạo giao dịch chi phí
        GiaoDich giaoDich = new GiaoDich();
        giaoDich.setSoTien(subscription.getSoTien());
        giaoDich.setMoTa("Thanh toán tự động: " + subscription.getTenDichVu());
        giaoDich.setLoai("expense");
        giaoDich.setNgayGiaoDich(LocalDateTime.now());

        giaoDichService.tao(
                subscription.getNguoiDung().getId(),
                subscription.getViTien().getId(),
                subscription.getDanhMuc().getId(),
                giaoDich
        );

        // 2. Tạo thông báo cho người dùng
        thongBaoService.taoThongBao(
                subscription.getNguoiDung(),
                "Thanh toán dịch vụ thành công",
                "Hệ thống đã tự động thực hiện thanh toán " + subscription.getSoTien() + " cho dịch vụ " + subscription.getTenDichVu(),
                "payment"
        );

        // 3. Cập nhật ngày thanh toán tiếp theo
        LocalDate nextDate = calculateNextPaymentDate(subscription.getNgayThanhToanTiep(), subscription.getChuKyThanhToan());
        subscription.setNgayThanhToanTiep(nextDate);
        dangKyDichVuRepository.save(subscription);
    }

    private LocalDate calculateNextPaymentDate(LocalDate current, String cycle) {
        if ("yearly".equalsIgnoreCase(cycle)) {
            return current.plusYears(1);
        } else {
            // Mặc định là hàng tháng (monthly)
            return current.plusMonths(1);
        }
    }
}
