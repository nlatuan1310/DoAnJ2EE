package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.dto.DanhMucDTO;
import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public DanhMucService(DanhMucRepository danhMucRepository, NguoiDungRepository nguoiDungRepository) {
        this.danhMucRepository = danhMucRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Transactional
    public List<DanhMucDTO.DanhMucResponse> layTheoNguoiDung(UUID nguoiDungId) {
        List<DanhMuc> danhMucs = danhMucRepository.findByNguoiDungId(nguoiDungId);
        
        // Auto-seed: Nếu user chưa có danh mục nào, hệ thống tự tạo danh mục mẫu
        if (danhMucs.isEmpty()) {
            danhMucs = khoiTaoDanhMucMau(nguoiDungId);
        }
        
        return danhMucs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<DanhMucDTO.DanhMucResponse> layTheoLoai(UUID nguoiDungId, String loai) {
        // Kiểm tra xem user đã có danh mục nào chưa (không phân biệt loại)
        if (danhMucRepository.findByNguoiDungId(nguoiDungId).isEmpty()) {
            khoiTaoDanhMucMau(nguoiDungId);
        }
        
        return danhMucRepository.findByNguoiDungIdAndLoai(nguoiDungId, loai)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DanhMucDTO.DanhMucResponse layTheoId(Integer id, UUID nguoiDungId) {
        DanhMuc dm = danhMucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
        
        kiểmTraQuyềnSởHữu(dm, nguoiDungId);
        
        return mapToResponse(dm);
    }

    public DanhMucDTO.DanhMucResponse tao(UUID nguoiDungId, DanhMucDTO.DanhMucRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));
        
        DanhMuc dm = DanhMuc.builder()
                .tenDanhMuc(request.getTenDanhMuc())
                .loai(request.getLoai())
                .icon(request.getIcon())
                .mauSac(request.getMauSac())
                .nguoiDung(nguoiDung)
                .build();
                
        return mapToResponse(danhMucRepository.save(dm));
    }

    public DanhMucDTO.DanhMucResponse capNhat(Integer id, UUID nguoiDungId, DanhMucDTO.DanhMucRequest request) {
        DanhMuc dm = danhMucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
        
        kiểmTraQuyềnSởHữu(dm, nguoiDungId);
        
        if (request.getTenDanhMuc() != null) dm.setTenDanhMuc(request.getTenDanhMuc());
        if (request.getLoai() != null) dm.setLoai(request.getLoai());
        if (request.getIcon() != null) dm.setIcon(request.getIcon());
        if (request.getMauSac() != null) dm.setMauSac(request.getMauSac());
        
        return mapToResponse(danhMucRepository.save(dm));
    }

    public void xoa(Integer id, UUID nguoiDungId) {
        DanhMuc dm = danhMucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
        
        kiểmTraQuyềnSởHữu(dm, nguoiDungId);
        
        danhMucRepository.delete(dm);
    }

    private void kiểmTraQuyềnSởHữu(DanhMuc dm, UUID nguoiDungId) {
        if (!dm.getNguoiDung().getId().equals(nguoiDungId)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên danh mục này");
        }
    }

    private List<DanhMuc> khoiTaoDanhMucMau(UUID nguoiDungId) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));

        List<DanhMuc> dmMau = new ArrayList<>();
        
        // Danh mục CHI
        dmMau.add(taoDmMau("Ăn uống", "chi", "Utensils", "#f87171", nguoiDung));
        dmMau.add(taoDmMau("Mua sắm", "chi", "ShoppingBag", "#fbbf24", nguoiDung));
        dmMau.add(taoDmMau("Di chuyển", "chi", "Car", "#60a5fa", nguoiDung));
        dmMau.add(taoDmMau("Giải trí", "chi", "Gamepad2", "#a78bfa", nguoiDung));
        dmMau.add(taoDmMau("Nhà cửa", "chi", "Home", "#34d399", nguoiDung));
        dmMau.add(taoDmMau("Hóa đơn", "chi", "Receipt", "#f472b6", nguoiDung));
        dmMau.add(taoDmMau("Sức khỏe", "chi", "HeartPulse", "#fb923c", nguoiDung));

        // Danh mục THU
        dmMau.add(taoDmMau("Lương", "thu", "Briefcase", "#10b981", nguoiDung));
        dmMau.add(taoDmMau("Thưởng", "thu", "Gift", "#3b82f6", nguoiDung));
        dmMau.add(taoDmMau("Đầu tư", "thu", "TrendingUp", "#8b5cf6", nguoiDung));

        return danhMucRepository.saveAll(dmMau);
    }

    private DanhMuc taoDmMau(String ten, String loai, String icon, String mauSac, NguoiDung nguoiDung) {
        return DanhMuc.builder()
                .tenDanhMuc(ten)
                .loai(loai)
                .icon(icon)
                .mauSac(mauSac)
                .nguoiDung(nguoiDung)
                .build();
    }

    private DanhMucDTO.DanhMucResponse mapToResponse(DanhMuc dm) {
        return DanhMucDTO.DanhMucResponse.builder()
                .id(dm.getId())
                .tenDanhMuc(dm.getTenDanhMuc())
                .loai(dm.getLoai())
                .icon(dm.getIcon())
                .mauSac(dm.getMauSac())
                .build();
    }
}

