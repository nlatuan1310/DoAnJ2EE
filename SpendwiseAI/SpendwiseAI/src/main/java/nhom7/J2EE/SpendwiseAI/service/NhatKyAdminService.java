package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.NhatKyAdmin;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.NhatKyAdminRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NhatKyAdminService {

    private final NhatKyAdminRepository nhatKyAdminRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public NhatKyAdminService(NhatKyAdminRepository nhatKyAdminRepository, NguoiDungRepository nguoiDungRepository) {
        this.nhatKyAdminRepository = nhatKyAdminRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public void ghiNhatKy(UUID adminId, String hanhDong, String bangDuLieu, UUID doiTuongId) {
        NguoiDung admin = nguoiDungRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin: " + adminId));

        NhatKyAdmin nhatKy = NhatKyAdmin.builder()
                .admin(admin)
                .hanhDong(hanhDong)
                .bangDuLieu(bangDuLieu)
                .doiTuongId(doiTuongId)
                .ngayTao(LocalDateTime.now())
                .build();

        nhatKyAdminRepository.save(nhatKy);
    }
    
    // Auto-detect current authenticated admin
    public void ghiNhatKy(String hanhDong, String bangDuLieu, UUID doiTuongId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String email = auth.getName();
            nguoiDungRepository.findByEmail(email).ifPresent(admin -> {
                ghiNhatKy(admin.getId(), hanhDong, bangDuLieu, doiTuongId);
            });
        }
    }

    public Page<NhatKyAdmin> layNhatKyPhanTrang(Pageable pageable) {
        return nhatKyAdminRepository.findAllByOrderByNgayTaoDesc(pageable);
    }

    public List<NhatKyAdmin> layTheoAdmin(UUID adminId) {
        return nhatKyAdminRepository.findByAdminIdOrderByNgayTaoDesc(adminId);
    }

    public List<NhatKyAdmin> layTheoBangDuLieu(String bangDuLieu) {
        return nhatKyAdminRepository.findByBangDuLieu(bangDuLieu);
    }
}
