package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.*;
import nhom7.J2EE.SpendwiseAI.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class MucTieuTietKiemService {

    private final MucTieuTietKiemRepository mucTieuRepository;
    private final DongGopTietKiemRepository dongGopRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ViTienRepository viTienRepository;
    private final GiaoDichRepository giaoDichRepository;

    public MucTieuTietKiemService(MucTieuTietKiemRepository mucTieuRepository,
                                   DongGopTietKiemRepository dongGopRepository,
                                   NguoiDungRepository nguoiDungRepository,
                                   ViTienRepository viTienRepository,
                                   GiaoDichRepository giaoDichRepository) {
        this.mucTieuRepository = mucTieuRepository;
        this.dongGopRepository = dongGopRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.viTienRepository = viTienRepository;
        this.giaoDichRepository = giaoDichRepository;
    }

    public List<MucTieuTietKiem> layTatCa() {
        return mucTieuRepository.findAll();
    }

    public List<MucTieuTietKiem> layTheoNguoiDung(UUID nguoiDungId) {
        return mucTieuRepository.findByNguoiDungId(nguoiDungId);
    }

    public MucTieuTietKiem layTheoId(UUID id) {
        return mucTieuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục tiêu: " + id));
    }

    public MucTieuTietKiem tao(UUID nguoiDungId, UUID viId, MucTieuTietKiem mucTieu) {
        NguoiDung nd = nguoiDungRepository.findById(nguoiDungId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        ViTien vi = viTienRepository.findById(viId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        mucTieu.setNguoiDung(nd);
        mucTieu.setViTien(vi);
        if (mucTieu.getSoTienHienTai() == null) mucTieu.setSoTienHienTai(BigDecimal.ZERO);
        return mucTieuRepository.save(mucTieu);
    }

    @Transactional
    public DongGopTietKiem dongGop(UUID mucTieuId, BigDecimal soTien) {
        MucTieuTietKiem mt = layTheoId(mucTieuId);
        
        // Cập nhật số tiền hiện tại của Mục tiêu
        mt.setSoTienHienTai(mt.getSoTienHienTai().add(soTien));
        mucTieuRepository.save(mt);

        // Lấy Ví gắn với Mục tiêu để trừ tiền
        ViTien vi = mt.getViTien();
        if (vi != null) {
            if (vi.getSoDu().compareTo(soTien) < 0) {
                throw new RuntimeException("Số dư trong ví không đủ để nạp tiền.");
            }
            vi.setSoDu(vi.getSoDu().subtract(soTien));
            viTienRepository.save(vi);
        }

        // Sinh ra 1 GiaoDich (Chi tiêu chuyển vào quỹ)
        GiaoDich gd = GiaoDich.builder()
                .viTien(vi)
                .nguoiDung(mt.getNguoiDung())
                .soTien(soTien)
                .loai("expense")
                .moTa("Nạp tiền vào quỹ: " + mt.getTenMucTieu())
                .aiCategorized(false)
                .ngayGiaoDich(java.time.LocalDateTime.now())
                .build();
        GiaoDich savedGd = giaoDichRepository.save(gd);

        // Lưu lịch sử đóng góp báo nối với Giao dịch
        DongGopTietKiem dongGop = DongGopTietKiem.builder()
                .mucTieu(mt)
                .giaoDich(savedGd)
                .soTien(soTien)
                .build();
        return dongGopRepository.save(dongGop);
    }

    public List<DongGopTietKiem> layDongGop(UUID mucTieuId) {
        return dongGopRepository.findByMucTieuId(mucTieuId);
    }

    @Transactional
    public void xoa(UUID id) {
        // Xoá các đóng góp (lịch sử nạp tiền) trước để không bị lỗi Foreign Key Constraint
        List<DongGopTietKiem> dongGops = dongGopRepository.findByMucTieuId(id);
        if (dongGops != null && !dongGops.isEmpty()) {
            dongGopRepository.deleteAll(dongGops);
        }
        
        // Sau đó xoá mục tiêu
        mucTieuRepository.deleteById(id);
    }
}
