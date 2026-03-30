package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.dto.NganSachDTO;
import nhom7.J2EE.SpendwiseAI.entity.*;
import nhom7.J2EE.SpendwiseAI.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class NganSachService {

    private final NganSachRepository nganSachRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ViTienRepository viTienRepository;
    private final DanhMucRepository danhMucRepository;
    private final GiaoDichRepository giaoDichRepository;
    private final CanhBaoRepository canhBaoRepository;

    public NganSachService(NganSachRepository nganSachRepository,
                           NguoiDungRepository nguoiDungRepository,
                           ViTienRepository viTienRepository,
                           DanhMucRepository danhMucRepository,
                           GiaoDichRepository giaoDichRepository,
                           CanhBaoRepository canhBaoRepository) {
        this.nganSachRepository = nganSachRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.viTienRepository = viTienRepository;
        this.danhMucRepository = danhMucRepository;
        this.giaoDichRepository = giaoDichRepository;
        this.canhBaoRepository = canhBaoRepository;
    }

    public List<NganSachDTO.NganSachResponse> layTheoNguoiDung(UUID nguoiDungId) {
        List<NganSach> nganSachs = nganSachRepository.findByNguoiDungId(nguoiDungId);
        tinhChiTieuVaCanhBao(nganSachs);
        return nganSachs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public NganSachDTO.NganSachResponse layTheoId(UUID id) {
        NganSach ns = nganSachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách: " + id));
        tinhChiTieuVaCanhBao(Arrays.asList(ns));
        return mapToResponse(ns);
    }

    public NganSachDTO.NganSachResponse tao(NganSachDTO.NganSachRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(request.getNguoiDungId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        ViTien vi = viTienRepository.findById(request.getViId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
        DanhMuc dm = danhMucRepository.findById(request.getDanhMucId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        validateThoiGianVaNganSach(nguoiDung.getId(), dm.getId(), request.getNgayBatDau(), request.getNgayKetThuc(), null, vi, request.getGioiHanTien());

        NganSach nganSach = NganSach.builder()
                .nguoiDung(nguoiDung)
                .viTien(vi)
                .danhMuc(dm)
                .gioiHanTien(request.getGioiHanTien())
                .chuKy(request.getChuKy())
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .build();
        
        NganSach saved = nganSachRepository.save(nganSach);
        tinhChiTieuVaCanhBao(Arrays.asList(saved));
        return mapToResponse(saved);
    }

    public NganSachDTO.NganSachResponse capNhat(UUID id, NganSachDTO.NganSachRequest request) {
        NganSach ns = nganSachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách: " + id));

        ViTien vi = ns.getViTien();
        if (request.getViId() != null && !request.getViId().equals(ns.getViTien().getId())) {
            vi = viTienRepository.findById(request.getViId()).orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
            ns.setViTien(vi);
        }

        DanhMuc dm = ns.getDanhMuc();
        if (request.getDanhMucId() != null && !request.getDanhMucId().equals(ns.getDanhMuc().getId())) {
            dm = danhMucRepository.findById(request.getDanhMucId()).orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            ns.setDanhMuc(dm);
        }

        BigDecimal newLimit = request.getGioiHanTien() != null ? request.getGioiHanTien() : ns.getGioiHanTien();
        LocalDate start = request.getNgayBatDau() != null ? request.getNgayBatDau() : ns.getNgayBatDau();
        LocalDate end = request.getNgayKetThuc() != null ? request.getNgayKetThuc() : ns.getNgayKetThuc();

        validateThoiGianVaNganSach(ns.getNguoiDung().getId(), dm.getId(), start, end, id, vi, newLimit);

        ns.setGioiHanTien(newLimit);
        ns.setNgayBatDau(start);
        ns.setNgayKetThuc(end);
        if (request.getChuKy() != null) ns.setChuKy(request.getChuKy());

        NganSach saved = nganSachRepository.save(ns);
        tinhChiTieuVaCanhBao(Arrays.asList(saved));
        return mapToResponse(saved);
    }

    public void xoa(UUID id) {
        nganSachRepository.deleteById(id);
    }

    private void validateThoiGianVaNganSach(UUID nguoiDungId, Integer danhMucId, LocalDate batDau, LocalDate ketThuc, UUID excludeId, ViTien vi, BigDecimal gioiHanTien) {
        if (batDau != null && ketThuc != null && batDau.isAfter(ketThuc)) {
            throw new RuntimeException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
        }

        if (batDau != null && ketThuc != null) {
            List<NganSach> overlaps = nganSachRepository.findOverlappingBudgets(nguoiDungId, danhMucId, batDau, ketThuc);
            boolean hasOverlap = overlaps.stream().anyMatch(o -> !o.getId().equals(excludeId));
            if (hasOverlap) {
                throw new RuntimeException("Đã tồn tại ngân sách cho danh mục này trong khoảng thời gian bị trùng lặp!");
            }
        }

        if (gioiHanTien != null && vi.getSoDu() != null) {
            if (gioiHanTien.compareTo(vi.getSoDu()) > 0) {
                throw new RuntimeException("Giới hạn thiết lập không được vượt quá số dư hiện tại của tài khoản ví!");
            }
        }
    }

    private void tinhChiTieuVaCanhBao(List<NganSach> nganSachs) {
        for (NganSach ns : nganSachs) {
            BigDecimal spent = BigDecimal.ZERO;
            if (ns.getNgayBatDau() != null && ns.getNgayKetThuc() != null && ns.getDanhMuc() != null) {
                LocalDateTime tuNgay = ns.getNgayBatDau().atStartOfDay();
                LocalDateTime denNgay = ns.getNgayKetThuc().atTime(23, 59, 59);
                List<GiaoDich> giaoDichs = giaoDichRepository.findByNguoiDungIdAndNgayGiaoDichBetween(
                        ns.getNguoiDung().getId(), tuNgay, denNgay);
                for (GiaoDich gd : giaoDichs) {
                    if ("expense".equals(gd.getLoai()) && 
                        gd.getDanhMuc() != null && 
                        gd.getDanhMuc().getId().equals(ns.getDanhMuc().getId())) {
                        spent = spent.add(gd.getSoTien());
                    }
                }
            }
            ns.setSpent(spent);

            BigDecimal gioiHan = ns.getGioiHanTien();
            if (gioiHan != null && gioiHan.compareTo(BigDecimal.ZERO) > 0) {
                double progress = spent.doubleValue() / gioiHan.doubleValue() * 100;
                ns.setProgress(progress);

                if (progress >= 100) {
                    taoCanhBaoNeuChuaCo(ns);
                }
            } else {
                ns.setProgress(0.0);
            }
        }
    }

    private void taoCanhBaoNeuChuaCo(NganSach ns) {
        String noiDung = String.format("Ngân sách cho danh mục '%s' đã vượt quá giới hạn. (Kỳ: %s đến %s)",
                ns.getDanhMuc().getTenDanhMuc(),
                ns.getNgayBatDau().toString(),
                ns.getNgayKetThuc().toString());
        String loai = "BUDGET_EXCEEDED";

        boolean exists = canhBaoRepository.existsByNguoiDungIdAndLoaiAndNoiDung(ns.getNguoiDung().getId(), loai, noiDung);
        if (!exists) {
            CanhBao canhBao = CanhBao.builder()
                    .nguoiDung(ns.getNguoiDung())
                    .loai(loai)
                    .noiDung(noiDung)
                    .daDoc(false)
                    .build();
            canhBaoRepository.save(canhBao);
        }
    }

    private NganSachDTO.NganSachResponse mapToResponse(NganSach ns) {
        return NganSachDTO.NganSachResponse.builder()
                .id(ns.getId())
                .danhMuc(ns.getDanhMuc() != null ? NganSachDTO.NganSachResponse.DanhMucInner.builder()
                        .id(ns.getDanhMuc().getId())
                        .tenDanhMuc(ns.getDanhMuc().getTenDanhMuc())
                        .icon(ns.getDanhMuc().getIcon())
                        .loai(ns.getDanhMuc().getLoai())
                        .build() : null)
                .viTien(ns.getViTien() != null ? NganSachDTO.NganSachResponse.ViTienInner.builder()
                        .id(ns.getViTien().getId())
                        .tenVi(ns.getViTien().getTenVi())
                        .build() : null)
                .gioiHanTien(ns.getGioiHanTien())
                .chuKy(ns.getChuKy())
                .ngayBatDau(ns.getNgayBatDau())
                .ngayKetThuc(ns.getNgayKetThuc())
                .spent(ns.getSpent() != null ? ns.getSpent() : BigDecimal.ZERO)
                .progress(ns.getProgress() != null ? ns.getProgress() : 0.0)
                .build();
    }
}
