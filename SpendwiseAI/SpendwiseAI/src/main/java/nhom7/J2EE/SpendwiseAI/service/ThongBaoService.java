package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.ThongBao;
import nhom7.J2EE.SpendwiseAI.repository.ThongBaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ThongBaoService {

    private final ThongBaoRepository thongBaoRepository;

    public ThongBaoService(ThongBaoRepository thongBaoRepository) {
        this.thongBaoRepository = thongBaoRepository;
    }

    public ThongBao taoThongBao(NguoiDung nguoiDung, String tieuDe, String noiDung, String loai) {
        ThongBao thongBao = ThongBao.builder()
                .nguoiDung(nguoiDung)
                .tieuDe(tieuDe)
                .noiDung(noiDung)
                .loai(loai)
                .daDoc(false)
                .ngayTao(LocalDateTime.now())
                .build();
        return thongBaoRepository.save(thongBao);
    }

    public List<ThongBao> layTheoNguoiDung(UUID nguoiDungId) {
        return thongBaoRepository.findByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId);
    }

    public void danhDauDaDoc(UUID thongBaoId) {
        thongBaoRepository.findById(thongBaoId).ifPresent(tb -> {
            tb.setDaDoc(true);
            thongBaoRepository.save(tb);
        });
    }
}
