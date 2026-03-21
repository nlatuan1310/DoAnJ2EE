package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.ViTien;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.ViTienRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ViTienService {

    private final ViTienRepository viTienRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public ViTienService(ViTienRepository viTienRepository, NguoiDungRepository nguoiDungRepository) {
        this.viTienRepository = viTienRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public List<ViTien> layTheoChuSoHuu(UUID nguoiDungId) {
        return viTienRepository.findByChuSoHuuId(nguoiDungId);
    }

    public ViTien layTheoId(UUID id) {
        return viTienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví: " + id));
    }

    public ViTien taoVi(UUID nguoiDungId, ViTien viTien) {
        NguoiDung chuSoHuu = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));
        viTien.setChuSoHuu(chuSoHuu);
        if (viTien.getSoDu() == null) viTien.setSoDu(BigDecimal.ZERO);
        return viTienRepository.save(viTien);
    }

    public ViTien capNhat(UUID id, ViTien duLieuMoi) {
        ViTien vi = layTheoId(id);
        if (duLieuMoi.getTenVi() != null) vi.setTenVi(duLieuMoi.getTenVi());
        if (duLieuMoi.getTienTe() != null) vi.setTienTe(duLieuMoi.getTienTe());
        return viTienRepository.save(vi);
    }

    public void xoa(UUID id) {
        viTienRepository.deleteById(id);
    }
}
