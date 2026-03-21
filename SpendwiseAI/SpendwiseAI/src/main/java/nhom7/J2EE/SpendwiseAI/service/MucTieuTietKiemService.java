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

    public MucTieuTietKiemService(MucTieuTietKiemRepository mucTieuRepository,
                                   DongGopTietKiemRepository dongGopRepository,
                                   NguoiDungRepository nguoiDungRepository,
                                   ViTienRepository viTienRepository) {
        this.mucTieuRepository = mucTieuRepository;
        this.dongGopRepository = dongGopRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.viTienRepository = viTienRepository;
    }

    public List<MucTieuTietKiem> layTheoNguoiDung(UUID nguoiDungId) {
        return mucTieuRepository.findByNguoiDungId(nguoiDungId);
    }

    public MucTieuTietKiem layTheoId(UUID id) {
        return mucTieuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục tiêu: " + id));
    }

    public MucTieuTietKiem tao(UUID nguoiDungId, UUID viId, MucTieuTietKiem mucTieu) {
        mucTieu.setNguoiDung(nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng")));
        mucTieu.setViTien(viTienRepository.findById(viId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví")));
        if (mucTieu.getSoTienHienTai() == null) mucTieu.setSoTienHienTai(BigDecimal.ZERO);
        return mucTieuRepository.save(mucTieu);
    }

    @Transactional
    public DongGopTietKiem dongGop(UUID mucTieuId, BigDecimal soTien) {
        MucTieuTietKiem mt = layTheoId(mucTieuId);
        mt.setSoTienHienTai(mt.getSoTienHienTai().add(soTien));
        mucTieuRepository.save(mt);

        DongGopTietKiem dongGop = DongGopTietKiem.builder()
                .mucTieu(mt)
                .soTien(soTien)
                .build();
        return dongGopRepository.save(dongGop);
    }

    public List<DongGopTietKiem> layDongGop(UUID mucTieuId) {
        return dongGopRepository.findByMucTieuId(mucTieuId);
    }

    public void xoa(UUID id) {
        mucTieuRepository.deleteById(id);
    }
}
