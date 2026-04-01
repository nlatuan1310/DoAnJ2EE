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
    private final DanhMucRepository danhMucRepository;

    public MucTieuTietKiemService(MucTieuTietKiemRepository mucTieuRepository,
                                   DongGopTietKiemRepository dongGopRepository,
                                   NguoiDungRepository nguoiDungRepository,
                                   ViTienRepository viTienRepository,
                                   GiaoDichRepository giaoDichRepository,
                                   DanhMucRepository danhMucRepository) {
        this.mucTieuRepository = mucTieuRepository;
        this.dongGopRepository = dongGopRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.viTienRepository = viTienRepository;
        this.giaoDichRepository = giaoDichRepository;
        this.danhMucRepository = danhMucRepository;
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
        ViTien vi = mt.getViTien();

        if (vi.getSoDu().compareTo(soTien) < 0) {
            throw new IllegalArgumentException("Số dư ví không đủ để đóng góp vào mục tiêu.");
        }

        // 1. Trừ tiền ví
        vi.setSoDu(vi.getSoDu().subtract(soTien));
        viTienRepository.save(vi);

        // 2. Cộng tiền mục tiêu
        mt.setSoTienHienTai(mt.getSoTienHienTai().add(soTien));
        mucTieuRepository.save(mt);

        // 3. Tìm hoặc tạo Danh mục chi tiêu cho Giao dịch đóng góp
        DanhMuc danhMucDonGop = danhMucRepository.findByNguoiDungIdAndLoai(mt.getNguoiDung().getId(), "expense").stream()
                .filter(d -> "Mục tiêu tiết kiệm".equalsIgnoreCase(d.getTenDanhMuc()))
                .findFirst()
                .orElseGet(() -> {
                    DanhMuc dm = DanhMuc.builder()
                            .nguoiDung(mt.getNguoiDung())
                            .tenDanhMuc("Mục tiêu tiết kiệm")
                            .loai("expense")
                            .icon("Target") // Icon tuỳ chỉnh hợp lệ phía FE
                            .mauSac("#6366f1") // Màu tím violet
                            .isSystem(false)
                            .build();
                    return danhMucRepository.save(dm);
                });

        // 4. Khởi tạo GiaoDich loại chi tiêu, có đính kèm DanhMuc
        GiaoDich gd = GiaoDich.builder()
                .viTien(vi)
                .nguoiDung(mt.getNguoiDung())
                .soTien(soTien)
                .loai("expense")
                .danhMuc(danhMucDonGop)
                .moTa("Nạp tiền vào mục tiêu: " + mt.getTenMucTieu())
                .ngayGiaoDich(java.time.LocalDateTime.now())
                .build();
        giaoDichRepository.save(gd);

        // 5. Lưu lịch sử đóng góp vào mục tiêu
        DongGopTietKiem dongGop = DongGopTietKiem.builder()
                .mucTieu(mt)
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
