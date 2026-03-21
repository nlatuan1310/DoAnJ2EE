package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.*;
import nhom7.J2EE.SpendwiseAI.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DangKyDichVuService {

    private final DangKyDichVuRepository dangKyDichVuRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ViTienRepository viTienRepository;
    private final DanhMucRepository danhMucRepository;

    public DangKyDichVuService(DangKyDichVuRepository dangKyDichVuRepository,
                               NguoiDungRepository nguoiDungRepository,
                               ViTienRepository viTienRepository,
                               DanhMucRepository danhMucRepository) {
        this.dangKyDichVuRepository = dangKyDichVuRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.viTienRepository = viTienRepository;
        this.danhMucRepository = danhMucRepository;
    }

    public List<DangKyDichVu> layTheoNguoiDung(UUID nguoiDungId) {
        return dangKyDichVuRepository.findByNguoiDungId(nguoiDungId);
    }

    public List<DangKyDichVu> laySapDenHan(LocalDate truocNgay) {
        return dangKyDichVuRepository.findByNgayThanhToanTiepBefore(truocNgay);
    }

    public DangKyDichVu layTheoId(UUID id) {
        return dangKyDichVuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký dịch vụ: " + id));
    }

    public DangKyDichVu tao(UUID nguoiDungId, UUID viId, Integer danhMucId, DangKyDichVu dkdv) {
        dkdv.setNguoiDung(nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng")));
        dkdv.setViTien(viTienRepository.findById(viId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví")));
        dkdv.setDanhMuc(danhMucRepository.findById(danhMucId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục")));
        return dangKyDichVuRepository.save(dkdv);
    }

    public DangKyDichVu capNhat(UUID id, DangKyDichVu duLieuMoi) {
        DangKyDichVu dv = layTheoId(id);
        if (duLieuMoi.getTenDichVu() != null) dv.setTenDichVu(duLieuMoi.getTenDichVu());
        if (duLieuMoi.getSoTien() != null) dv.setSoTien(duLieuMoi.getSoTien());
        if (duLieuMoi.getChuKyThanhToan() != null) dv.setChuKyThanhToan(duLieuMoi.getChuKyThanhToan());
        if (duLieuMoi.getNgayThanhToanTiep() != null) dv.setNgayThanhToanTiep(duLieuMoi.getNgayThanhToanTiep());
        return dangKyDichVuRepository.save(dv);
    }

    public void xoa(UUID id) {
        dangKyDichVuRepository.deleteById(id);
    }
}
