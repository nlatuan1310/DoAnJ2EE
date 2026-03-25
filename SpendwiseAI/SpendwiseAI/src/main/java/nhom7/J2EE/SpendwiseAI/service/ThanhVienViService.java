package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.ThanhVienVi;
import nhom7.J2EE.SpendwiseAI.entity.ViTien;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.ThanhVienViRepository;
import nhom7.J2EE.SpendwiseAI.repository.ViTienRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ThanhVienViService {

    private final ThanhVienViRepository thanhVienViRepository;
    private final ViTienRepository viTienRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public ThanhVienViService(ThanhVienViRepository thanhVienViRepository,
                               ViTienRepository viTienRepository,
                               NguoiDungRepository nguoiDungRepository) {
        this.thanhVienViRepository = thanhVienViRepository;
        this.viTienRepository = viTienRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public List<ThanhVienVi> layThanhVienTheoVi(UUID viId) {
        return thanhVienViRepository.findByIdViId(viId);
    }

    public List<ThanhVienVi> layViTheoNguoiDung(UUID nguoiDungId) {
        return thanhVienViRepository.findByIdNguoiDungId(nguoiDungId);
    }

    public ThanhVienVi themThanhVien(UUID viId, UUID nguoiDungId, String vaiTro) {
        ViTien viTien = viTienRepository.findById(viId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví: " + viId));
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));

        ThanhVienVi.ThanhVienViId id = new ThanhVienVi.ThanhVienViId(viId, nguoiDungId);

        // Nếu đã tồn tại thì chỉ cập nhật vai trò
        if (thanhVienViRepository.existsById(id)) {
            ThanhVienVi existing = thanhVienViRepository.findById(id)
                    .orElseThrow();
            existing.setVaiTro(vaiTro);
            return thanhVienViRepository.save(existing);
        }

        ThanhVienVi thanhVien = ThanhVienVi.builder()
                .id(id)
                .viTien(viTien)
                .nguoiDung(nguoiDung)
                .vaiTro(vaiTro != null ? vaiTro : "viewer")
                .build();
        return thanhVienViRepository.save(thanhVien);
    }

    public void xoaThanhVien(UUID viId, UUID nguoiDungId) {
        ThanhVienVi.ThanhVienViId id = new ThanhVienVi.ThanhVienViId(viId, nguoiDungId);
        thanhVienViRepository.deleteById(id);
    }
}
