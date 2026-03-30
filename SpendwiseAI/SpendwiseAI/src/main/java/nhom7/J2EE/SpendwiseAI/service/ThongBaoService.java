package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NganSach;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.ThongBao;
import nhom7.J2EE.SpendwiseAI.repository.ThongBaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ThongBaoService {

    private final ThongBaoRepository thongBaoRepository;

    public ThongBaoService(ThongBaoRepository thongBaoRepository) {
        this.thongBaoRepository = thongBaoRepository;
    }

    /**
     * Lấy tất cả thông báo của người dùng (mới nhất lên đầu).
     */
    public List<ThongBao> layTheoNguoiDung(UUID nguoiDungId) {
        return thongBaoRepository.findByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId);
    }

    /**
     * Lấy các thông báo chưa đọc.
     */
    public List<ThongBao> layChuaDoc(UUID nguoiDungId) {
        return thongBaoRepository.findByNguoiDungIdAndDaDoc(nguoiDungId, false);
    }

    /**
     * Đếm số thông báo chưa đọc.
     */
    public long demChuaDoc(UUID nguoiDungId) {
        return thongBaoRepository.findByNguoiDungIdAndDaDoc(nguoiDungId, false).size();
    }

    /**
     * Đánh dấu 1 thông báo đã đọc.
     */
    @Transactional
    public void danhDauDaDoc(UUID id) {
        ThongBao tb = thongBaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo: " + id));
        tb.setDaDoc(true);
        thongBaoRepository.save(tb);
    }

    /**
     * Đánh dấu TẤT CẢ thông báo của user đã đọc.
     */
    @Transactional
    public void danhDauTatCaDaDoc(UUID nguoiDungId) {
        List<ThongBao> chuaDoc = thongBaoRepository.findByNguoiDungIdAndDaDoc(nguoiDungId, false);
        chuaDoc.forEach(tb -> tb.setDaDoc(true));
        thongBaoRepository.saveAll(chuaDoc);
    }

    /**
     * Tạo thông báo cảnh báo vượt ngân sách.
     */
    @Transactional
    public void taoCanhBaoVuotNganSach(NguoiDung nguoiDung, NganSach nganSach,
                                        java.math.BigDecimal tongDaChi) {
        String tenDanhMuc = nganSach.getDanhMuc() != null
                ? nganSach.getDanhMuc().getTenDanhMuc()
                : "Không rõ";

        String tieuDe = "⚠️ Vượt ngân sách: " + tenDanhMuc;
        String noiDung = String.format(
                "Bạn đã chi %s cho danh mục \"%s\", vượt giới hạn %s đã đặt.",
                formatVND(tongDaChi),
                tenDanhMuc,
                formatVND(nganSach.getGioiHanTien())
        );

        ThongBao tb = ThongBao.builder()
                .nguoiDung(nguoiDung)
                .tieuDe(tieuDe)
                .noiDung(noiDung)
                .loai("canh_bao_ngan_sach")
                .daDoc(false)
                .build();

        thongBaoRepository.save(tb);
    }

    private String formatVND(java.math.BigDecimal amount) {
        if (amount == null) return "0 ₫";
        return String.format("%,.0f ₫", amount);
    }
}
