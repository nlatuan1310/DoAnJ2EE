package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.ThanhVienVi;
import nhom7.J2EE.SpendwiseAI.entity.ViTien;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.ThanhVienViRepository;
import nhom7.J2EE.SpendwiseAI.repository.ViTienRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ViTienService {

    private final ViTienRepository viTienRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ThanhVienViRepository thanhVienViRepository;

    public ViTienService(ViTienRepository viTienRepository, 
                         NguoiDungRepository nguoiDungRepository,
                         ThanhVienViRepository thanhVienViRepository) {
        this.viTienRepository = viTienRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.thanhVienViRepository = thanhVienViRepository;
    }

    public List<ViTien> layTheoChuSoHuu(UUID nguoiDungId) {
        List<ViTien> vís = viTienRepository.findAccessibleWallets(nguoiDungId);
        vís.forEach(vi -> {
            vi.setTenChuSoHuu(vi.getChuSoHuu().getHoVaTen());
            vi.setSoThanhVien(thanhVienViRepository.countByIdViId(vi.getId()));
            
            if (vi.getChuSoHuu().getId().equals(nguoiDungId)) {
                vi.setVaiTro("OWNER");
            } else {
                thanhVienViRepository.findById(new ThanhVienVi.ThanhVienViId(vi.getId(), nguoiDungId))
                        .ifPresent(tv -> vi.setVaiTro(tv.getVaiTro()));
            }
        });
        return vís;
    }

    public ViTien layTheoId(UUID id) {
        return viTienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví: " + id));
    }

    @Transactional
    public ViTien taoVi(UUID nguoiDungId, ViTien viTien) {
        NguoiDung chuSoHuu = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));
        
        // Tránh lỗi nếu frontend gửi ID null/rỗng
        viTien.setId(null);
        viTien.setChuSoHuu(chuSoHuu);
        if (viTien.getSoDu() == null) viTien.setSoDu(BigDecimal.ZERO);
        if (viTien.getTienTe() == null) viTien.setTienTe("VND");
        
        return viTienRepository.save(viTien);
    }

    public ViTien capNhat(UUID id, ViTien duLieuMoi) {
        ViTien vi = layTheoId(id);
        if (duLieuMoi.getTenVi() != null) vi.setTenVi(duLieuMoi.getTenVi());
        if (duLieuMoi.getTienTe() != null) vi.setTienTe(duLieuMoi.getTienTe());
        if (duLieuMoi.getSoDu() != null) vi.setSoDu(duLieuMoi.getSoDu());
        return viTienRepository.save(vi);
    }

    public void xoa(UUID id) {
        viTienRepository.deleteById(id);
    }

    @Transactional
    public ThanhVienVi moiThanhVien(UUID viId, String email, String vaiTro) {
        ViTien vi = layTheoId(viId);
        NguoiDung nguoiMoi = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        if (vi.getChuSoHuu().getId().equals(nguoiMoi.getId())) {
            throw new RuntimeException("Người này đã là chủ sở hữu của ví.");
        }

        ThanhVienVi.ThanhVienViId id = new ThanhVienVi.ThanhVienViId(viId, nguoiMoi.getId());
        if (thanhVienViRepository.existsById(id)) {
            throw new RuntimeException("Người này đã là thành viên của ví.");
        }

        ThanhVienVi thanhVien = ThanhVienVi.builder()
                .id(id)
                .viTien(vi)
                .nguoiDung(nguoiMoi)
                .vaiTro(vaiTro)
                .build();

        return thanhVienViRepository.save(thanhVien);
    }

    @Transactional
    public void xoaThanhVien(UUID viId, UUID nguoiDungId) {
        ThanhVienVi.ThanhVienViId id = new ThanhVienVi.ThanhVienViId(viId, nguoiDungId);
        thanhVienViRepository.deleteById(id);
    }

    @Transactional
    public ThanhVienVi capNhatVaiTro(UUID viId, UUID nguoiDungId, String vaiTroMoi) {
        ThanhVienVi.ThanhVienViId id = new ThanhVienVi.ThanhVienViId(viId, nguoiDungId);
        ThanhVienVi tv = thanhVienViRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong ví này."));
        tv.setVaiTro(vaiTroMoi);
        return thanhVienViRepository.save(tv);
    }

    public List<ThanhVienVi> layDanhSachThanhVien(UUID viId) {
        return thanhVienViRepository.findByIdViId(viId);
    }

    public boolean coQuyen(UUID viId, UUID nguoiDungId, String vaiTroYeuCau) {
        ViTien vi = layTheoId(viId);
        // Chủ sở hữu luôn có toàn quyền
        if (vi.getChuSoHuu().getId().equals(nguoiDungId)) return true;

        ThanhVienVi.ThanhVienViId id = new ThanhVienVi.ThanhVienViId(viId, nguoiDungId);
        return thanhVienViRepository.findById(id)
                .map(tv -> {
                    String vaiTro = tv.getVaiTro();
                    if ("EDITOR".equalsIgnoreCase(vaiTroYeuCau)) {
                        return "EDITOR".equalsIgnoreCase(vaiTro);
                    }
                    if ("VIEWER".equalsIgnoreCase(vaiTroYeuCau)) {
                        return "VIEWER".equalsIgnoreCase(vaiTro) || "EDITOR".equalsIgnoreCase(vaiTro);
                    }
                    return false;
                }).orElse(false);
    }
}
