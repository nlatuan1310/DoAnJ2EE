package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public NguoiDungService(NguoiDungRepository nguoiDungRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.jdbcTemplate = jdbcTemplate;
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

    @org.springframework.transaction.annotation.Transactional
    public void xoa(UUID id) {
        String[] bangCoNguoiDungId = {
            "thanh_vien_vi", "giao_dich", "muc_tieu_tiet_kiem", 
            "the_tag", "danh_muc", "thong_bao", "quet_hoa_don", "ngan_sach", 
            "lich_su_tim_kiem", "danh_muc_crypto", "dang_ky_dich_vu", 
            "cau_hoi_ai", "canh_bao", "bao_cao"
        };
        for (String bang : bangCoNguoiDungId) {
            jdbcTemplate.update("DELETE FROM " + bang + " WHERE nguoi_dung_id = ?", id);
        }
        
        // Bảng ví tiền dùng tên cột khác
        jdbcTemplate.update("DELETE FROM vi_tien WHERE chu_so_huu_id = ?", id);
        
        nguoiDungRepository.deleteById(id);
    }
}
