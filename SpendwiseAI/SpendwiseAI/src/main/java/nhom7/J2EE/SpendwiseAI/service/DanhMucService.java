package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public DanhMucService(DanhMucRepository danhMucRepository, NguoiDungRepository nguoiDungRepository) {
        this.danhMucRepository = danhMucRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public List<DanhMuc> layTheoNguoiDung(UUID nguoiDungId) {
        return danhMucRepository.findByNguoiDungId(nguoiDungId);
    }

    public List<DanhMuc> layTheoLoai(UUID nguoiDungId, String loai) {
        return danhMucRepository.findByNguoiDungIdAndLoai(nguoiDungId, loai);
    }

    public DanhMuc layTheoId(Integer id) {
        return danhMucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
    }

    public DanhMuc tao(UUID nguoiDungId, DanhMuc danhMuc) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));
        danhMuc.setNguoiDung(nguoiDung);
        return danhMucRepository.save(danhMuc);
    }

    public DanhMuc capNhat(Integer id, DanhMuc duLieuMoi) {
        DanhMuc dm = layTheoId(id);
        if (duLieuMoi.getTenDanhMuc() != null) dm.setTenDanhMuc(duLieuMoi.getTenDanhMuc());
        if (duLieuMoi.getLoai() != null) dm.setLoai(duLieuMoi.getLoai());
        if (duLieuMoi.getIcon() != null) dm.setIcon(duLieuMoi.getIcon());
        if (duLieuMoi.getMauSac() != null) dm.setMauSac(duLieuMoi.getMauSac());
        return danhMucRepository.save(dm);
    }

    public void xoa(Integer id) {
        danhMucRepository.deleteById(id);
    }
}
