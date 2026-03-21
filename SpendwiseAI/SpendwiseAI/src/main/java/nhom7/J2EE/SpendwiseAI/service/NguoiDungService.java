package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;

    public NguoiDungService(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public List<NguoiDung> layTatCa() {
        return nguoiDungRepository.findAll();
    }

    public NguoiDung layTheoId(UUID id) {
        return nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + id));
    }

    public NguoiDung layTheoEmail(String email) {
        return nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + email));
    }

    public NguoiDung capNhat(UUID id, NguoiDung duLieuMoi) {
        NguoiDung nguoiDung = layTheoId(id);
        if (duLieuMoi.getHoVaTen() != null) nguoiDung.setHoVaTen(duLieuMoi.getHoVaTen());
        if (duLieuMoi.getDienThoai() != null) nguoiDung.setDienThoai(duLieuMoi.getDienThoai());
        if (duLieuMoi.getAnhDaiDien() != null) nguoiDung.setAnhDaiDien(duLieuMoi.getAnhDaiDien());
        if (duLieuMoi.getTienTe() != null) nguoiDung.setTienTe(duLieuMoi.getTienTe());
        return nguoiDungRepository.save(nguoiDung);
    }

    public void xoa(UUID id) {
        nguoiDungRepository.deleteById(id);
    }
}
