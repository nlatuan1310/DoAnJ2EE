package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.*;
import nhom7.J2EE.SpendwiseAI.repository.*;
import nhom7.J2EE.SpendwiseAI.specification.GiaoDichSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GiaoDichService {

    private final GiaoDichRepository giaoDichRepository;
    private final ViTienRepository viTienRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DanhMucRepository danhMucRepository;

    public GiaoDichService(GiaoDichRepository giaoDichRepository,
                           ViTienRepository viTienRepository,
                           NguoiDungRepository nguoiDungRepository,
                           DanhMucRepository danhMucRepository) {
        this.giaoDichRepository = giaoDichRepository;
        this.viTienRepository = viTienRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.danhMucRepository = danhMucRepository;
    }

    public List<GiaoDich> layTheoNguoiDung(UUID nguoiDungId) {
        return giaoDichRepository.findByNguoiDungId(nguoiDungId);
    }

    public List<GiaoDich> layTheoVi(UUID viId) {
        return giaoDichRepository.findByViTienId(viId);
    }

    public List<GiaoDich> layTheoKhoangThoiGian(UUID nguoiDungId,
                                                 LocalDateTime tuNgay,
                                                 LocalDateTime denNgay) {
        return giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(
                nguoiDungId, tuNgay, denNgay);
    }

    public GiaoDich layTheoId(UUID id) {
        return giaoDichRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch: " + id));
    }

    @Transactional
    public GiaoDich tao(UUID nguoiDungId, UUID viId, Integer danhMucId, GiaoDich giaoDich) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        ViTien vi = viTienRepository.findById(viId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
        DanhMuc danhMuc = danhMucRepository.findById(danhMucId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        giaoDich.setNguoiDung(nguoiDung);
        giaoDich.setViTien(vi);
        giaoDich.setDanhMuc(danhMuc);

        // Cập nhật số dư ví
        if ("income".equalsIgnoreCase(giaoDich.getLoai())) {
            vi.setSoDu(vi.getSoDu().add(giaoDich.getSoTien()));
        } else if ("expense".equalsIgnoreCase(giaoDich.getLoai())) {
            vi.setSoDu(vi.getSoDu().subtract(giaoDich.getSoTien()));
        }
        viTienRepository.save(vi);

        return giaoDichRepository.save(giaoDich);
    }

    @Transactional
    public void xoa(UUID id) {
        GiaoDich gd = layTheoId(id);
        // Hoàn lại số dư ví
        ViTien vi = gd.getViTien();
        if ("income".equalsIgnoreCase(gd.getLoai())) {
            vi.setSoDu(vi.getSoDu().subtract(gd.getSoTien()));
        } else if ("expense".equalsIgnoreCase(gd.getLoai())) {
            vi.setSoDu(vi.getSoDu().add(gd.getSoTien()));
        }
        viTienRepository.save(vi);
        giaoDichRepository.deleteById(id);
    }

    /**
     * Tìm kiếm nâng cao: kết hợp nhiều điều kiện lọc + phân trang.
     */
    public Page<GiaoDich> timKiemNangCao(UUID nguoiDungId,
                                          String keyword,
                                          String loai,
                                          LocalDateTime tuNgay,
                                          LocalDateTime denNgay,
                                          BigDecimal tuSoTien,
                                          BigDecimal denSoTien,
                                          Integer danhMucId,
                                          Pageable pageable) {

        Specification<GiaoDich> spec = Specification.where(
                GiaoDichSpecification.thuocNguoiDung(nguoiDungId)
        );

        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and(GiaoDichSpecification.chứaTuKhoa(keyword));
        }
        if (loai != null && !loai.isBlank()) {
            spec = spec.and(GiaoDichSpecification.theoLoai(loai));
        }
        if (tuNgay != null) {
            spec = spec.and(GiaoDichSpecification.tuNgay(tuNgay));
        }
        if (denNgay != null) {
            spec = spec.and(GiaoDichSpecification.denNgay(denNgay));
        }
        if (tuSoTien != null) {
            spec = spec.and(GiaoDichSpecification.tuSoTien(tuSoTien));
        }
        if (denSoTien != null) {
            spec = spec.and(GiaoDichSpecification.denSoTien(denSoTien));
        }
        if (danhMucId != null) {
            spec = spec.and(GiaoDichSpecification.theoDanhMuc(danhMucId));
        }

        return giaoDichRepository.findAll(spec, pageable);
    }
}
