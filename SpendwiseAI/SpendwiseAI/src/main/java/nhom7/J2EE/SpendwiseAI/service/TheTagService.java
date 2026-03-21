package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.TheTag;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.TheTagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TheTagService {

    private final TheTagRepository theTagRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public TheTagService(TheTagRepository theTagRepository, NguoiDungRepository nguoiDungRepository) {
        this.theTagRepository = theTagRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public List<TheTag> layTheoNguoiDung(UUID nguoiDungId) {
        return theTagRepository.findByNguoiDungId(nguoiDungId);
    }

    public TheTag tao(UUID nguoiDungId, TheTag tag) {
        tag.setNguoiDung(nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng")));
        return theTagRepository.save(tag);
    }

    public void xoa(Integer id) {
        theTagRepository.deleteById(id);
    }
}
