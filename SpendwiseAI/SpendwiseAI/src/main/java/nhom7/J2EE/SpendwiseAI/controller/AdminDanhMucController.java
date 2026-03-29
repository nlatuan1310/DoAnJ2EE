package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.DanhMucDTO;
import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucRepository;
import nhom7.J2EE.SpendwiseAI.service.NhatKyAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/danh-muc-he-thong")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDanhMucController {

    private final DanhMucRepository danhMucRepository;
    private final NhatKyAdminService nhatKyAdminService;

    public AdminDanhMucController(DanhMucRepository danhMucRepository, NhatKyAdminService nhatKyAdminService) {
        this.danhMucRepository = danhMucRepository;
        this.nhatKyAdminService = nhatKyAdminService;
    }

    @GetMapping
    public ResponseEntity<List<DanhMucDTO.DanhMucResponse>> layTatCaHeThong() {
        List<DanhMucDTO.DanhMucResponse> ds = danhMucRepository.findByIsSystemTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ds);
    }

    @PostMapping
    public ResponseEntity<DanhMucDTO.DanhMucResponse> taoHeThong(@RequestBody DanhMucDTO.DanhMucRequest request) {
        DanhMuc dm = DanhMuc.builder()
                .tenDanhMuc(request.getTenDanhMuc())
                .loai(request.getLoai())
                .icon(request.getIcon())
                .mauSac(request.getMauSac())
                .isSystem(true)
                .nguoiDung(null) // System categories belong to no specific user
                .build();
                
        DanhMuc saved = danhMucRepository.save(dm);
        
        try {
            nhatKyAdminService.ghiNhatKy("TAO_DANH_MUC_HE_THONG", "danh_muc", null);
        } catch (Exception e) {}
        
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhMucDTO.DanhMucResponse> capNhatHeThong(@PathVariable Integer id, @RequestBody DanhMucDTO.DanhMucRequest request) {
        DanhMuc dm = danhMucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
        
        if (!Boolean.TRUE.equals(dm.getIsSystem())) {
            throw new RuntimeException("Chỉ được cập nhật danh mục hệ thống ở endpoint này");
        }
        
        if (request.getTenDanhMuc() != null) dm.setTenDanhMuc(request.getTenDanhMuc());
        if (request.getLoai() != null) dm.setLoai(request.getLoai());
        if (request.getIcon() != null) dm.setIcon(request.getIcon());
        if (request.getMauSac() != null) dm.setMauSac(request.getMauSac());
        
        DanhMuc saved = danhMucRepository.save(dm);
        
        try {
            nhatKyAdminService.ghiNhatKy("CAP_NHAT_DANH_MUC_HE_THONG", "danh_muc", null);
        } catch (Exception e) {}
        
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaHeThong(@PathVariable Integer id) {
        DanhMuc dm = danhMucRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
        
        if (!Boolean.TRUE.equals(dm.getIsSystem())) {
            throw new RuntimeException("Chỉ được xóa danh mục hệ thống ở endpoint này");
        }
        
        danhMucRepository.delete(dm);
        
        try {
            nhatKyAdminService.ghiNhatKy("XOA_DANH_MUC_HE_THONG", "danh_muc", null);
        } catch (Exception e) {}
        
        return ResponseEntity.noContent().build();
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
