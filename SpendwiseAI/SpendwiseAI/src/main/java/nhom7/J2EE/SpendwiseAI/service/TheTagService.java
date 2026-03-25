package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.dto.TheTagDTO;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.TheTag;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.TheTagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TheTagService {

    private final TheTagRepository theTagRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public TheTagService(TheTagRepository theTagRepository, NguoiDungRepository nguoiDungRepository) {
        this.theTagRepository = theTagRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public List<TheTagDTO.TheTagResponse> layTheoNguoiDung(UUID nguoiDungId) {
        return theTagRepository.findByNguoiDungId(nguoiDungId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TheTagDTO.TheTagResponse tao(UUID nguoiDungId, TheTagDTO.TheTagRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        TheTag tag = TheTag.builder()
                .tenTag(request.getTenTag())
                .nguoiDung(nguoiDung)
                .build();
                
        return mapToResponse(theTagRepository.save(tag));
    }

    public TheTagDTO.TheTagResponse capNhat(Integer id, UUID nguoiDungId, TheTagDTO.TheTagRequest request) {
        TheTag tag = theTagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thẻ: " + id));
        
        kiểmTraQuyềnSởHữu(tag, nguoiDungId);
        
        if (request.getTenTag() != null) tag.setTenTag(request.getTenTag());
        
        return mapToResponse(theTagRepository.save(tag));
    }

    public void xoa(Integer id, UUID nguoiDungId) {
        TheTag tag = theTagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thẻ: " + id));
        
        kiểmTraQuyềnSởHữu(tag, nguoiDungId);
        
        theTagRepository.delete(tag);
    }

    private void kiểmTraQuyềnSởHữu(TheTag tag, UUID nguoiDungId) {
        if (!tag.getNguoiDung().getId().equals(nguoiDungId)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên thẻ này");
        }
    }

    private TheTagDTO.TheTagResponse mapToResponse(TheTag tag) {
        return TheTagDTO.TheTagResponse.builder()
                .id(tag.getId())
                .tenTag(tag.getTenTag())
                .build();
    }
}

