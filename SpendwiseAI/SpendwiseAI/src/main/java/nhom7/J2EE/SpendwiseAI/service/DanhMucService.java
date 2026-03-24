package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.dto.DanhMucDTO;
import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

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

    public List<DanhMucDTO.DanhMucResponse> layTheoNguoiDung(UUID nguoiDungId) {
        return danhMucRepository.findByNguoiDungId(nguoiDungId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DanhMucDTO.DanhMucResponse> layTheoLoai(UUID nguoiDungId, String loai) {
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

