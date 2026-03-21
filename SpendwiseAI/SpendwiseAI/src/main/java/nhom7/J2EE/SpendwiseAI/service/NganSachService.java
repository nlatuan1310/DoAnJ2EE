package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.*;
import nhom7.J2EE.SpendwiseAI.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NganSachService {

    private final NganSachRepository nganSachRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ViTienRepository viTienRepository;
    private final DanhMucRepository danhMucRepository;

    public NganSachService(NganSachRepository nganSachRepository,
                           NguoiDungRepository nguoiDungRepository,
                           ViTienRepository viTienRepository,
                           DanhMucRepository danhMucRepository) {
        this.nganSachRepository = nganSachRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.viTienRepository = viTienRepository;
        this.danhMucRepository = danhMucRepository;
    }

    public List<NganSach> layTheoNguoiDung(UUID nguoiDungId) {
        return nganSachRepository.findByNguoiDungId(nguoiDungId);
    }

    public NganSach layTheoId(UUID id) {
        return nganSachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách: " + id));
    }

    public NganSach tao(UUID nguoiDungId, UUID viId, Integer danhMucId, NganSach nganSach) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        ViTien vi = viTienRepository.findById(viId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
        DanhMuc dm = danhMucRepository.findById(danhMucId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        nganSach.setNguoiDung(nguoiDung);
        nganSach.setViTien(vi);
        nganSach.setDanhMuc(dm);
        return nganSachRepository.save(nganSach);
    }

    public NganSach capNhat(UUID id, NganSach duLieuMoi) {
        NganSach ns = layTheoId(id);
        if (duLieuMoi.getGioiHanTien() != null) ns.setGioiHanTien(duLieuMoi.getGioiHanTien());
        if (duLieuMoi.getChuKy() != null) ns.setChuKy(duLieuMoi.getChuKy());
        if (duLieuMoi.getNgayBatDau() != null) ns.setNgayBatDau(duLieuMoi.getNgayBatDau());
        if (duLieuMoi.getNgayKetThuc() != null) ns.setNgayKetThuc(duLieuMoi.getNgayKetThuc());
        return nganSachRepository.save(ns);
    }

    public void xoa(UUID id) {
        nganSachRepository.deleteById(id);
    }
}
