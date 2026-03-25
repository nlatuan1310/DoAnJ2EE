package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.DanhMucCrypto;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDichCrypto;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucCryptoRepository;
import nhom7.J2EE.SpendwiseAI.repository.GiaoDichCryptoRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.TaiSanCryptoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CryptoService {

    private final DanhMucCryptoRepository danhMucCryptoRepository;
    private final GiaoDichCryptoRepository giaoDichCryptoRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final TaiSanCryptoRepository taiSanCryptoRepository;

    public CryptoService(DanhMucCryptoRepository danhMucCryptoRepository,
                         GiaoDichCryptoRepository giaoDichCryptoRepository,
                         NguoiDungRepository nguoiDungRepository,
                         TaiSanCryptoRepository taiSanCryptoRepository) {
        this.danhMucCryptoRepository = danhMucCryptoRepository;
        this.giaoDichCryptoRepository = giaoDichCryptoRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.taiSanCryptoRepository = taiSanCryptoRepository;
    }

    // ========================
    //  DANH MUC (Portfolio)
    // ========================

    public List<DanhMucCrypto> layDanhMucTheoNguoiDung(UUID nguoiDungId) {
        return danhMucCryptoRepository.findByNguoiDungId(nguoiDungId);
    }

    public DanhMucCrypto layDanhMucTheoId(UUID id) {
        return danhMucCryptoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục crypto: " + id));
    }

    @Transactional
    public DanhMucCrypto themVaoDanhMuc(UUID nguoiDungId, Integer taiSanId, DanhMucCrypto duLieu) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));
        TaiSanCrypto taiSan = taiSanCryptoRepository.findById(taiSanId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài sản crypto: " + taiSanId));

        duLieu.setNguoiDung(nguoiDung);
        duLieu.setTaiSan(taiSan);
        if (duLieu.getSoLuong() == null) duLieu.setSoLuong(BigDecimal.ZERO);
        if (duLieu.getGiaMuaTrungBinh() == null) duLieu.setGiaMuaTrungBinh(BigDecimal.ZERO);

        return danhMucCryptoRepository.save(duLieu);
    }

    @Transactional
    public DanhMucCrypto capNhatDanhMuc(UUID id, DanhMucCrypto duLieuMoi) {
        DanhMucCrypto dm = layDanhMucTheoId(id);
        if (duLieuMoi.getSoLuong() != null) dm.setSoLuong(duLieuMoi.getSoLuong());
        if (duLieuMoi.getGiaMuaTrungBinh() != null) dm.setGiaMuaTrungBinh(duLieuMoi.getGiaMuaTrungBinh());
        if (duLieuMoi.getDiaChiVi() != null) dm.setDiaChiVi(duLieuMoi.getDiaChiVi());
        return danhMucCryptoRepository.save(dm);
    }

    @Transactional
    public void xoaDanhMuc(UUID id) {
        // Xóa các giao dịch liên quan trước
        List<GiaoDichCrypto> giaoDichs = giaoDichCryptoRepository.findByDanhMucCryptoId(id);
        giaoDichCryptoRepository.deleteAll(giaoDichs);
        danhMucCryptoRepository.deleteById(id);
    }

    // ========================
    //  GIAO DICH (Transactions)
    // ========================

    public List<GiaoDichCrypto> layGiaoDichTheoDanhMuc(UUID danhMucId) {
        return giaoDichCryptoRepository.findByDanhMucCryptoId(danhMucId);
    }

    /**
     * Ghi nhận một giao dịch mới (buy/sell).
     * - Buy: cập nhật lại giá mua trung bình (bình quân gia quyền) và cộng số lượng.
     * - Sell: trừ số lượng (giá TB giữ nguyên).
     */
    @Transactional
    public GiaoDichCrypto ghiGiaoDich(UUID danhMucId, GiaoDichCrypto duLieu) {
        DanhMucCrypto dm = layDanhMucTheoId(danhMucId);
        duLieu.setDanhMucCrypto(dm);
        if (duLieu.getNgayGiaoDich() == null) duLieu.setNgayGiaoDich(LocalDateTime.now());

        if ("buy".equalsIgnoreCase(duLieu.getLoai())) {
            // Tính giá mua trung bình mới: (soLuongCu * giaTBCu + soLuongMoi * giaMoi) / (soLuongCu + soLuongMoi)
            BigDecimal soLuongCu = dm.getSoLuong() != null ? dm.getSoLuong() : BigDecimal.ZERO;
            BigDecimal giaTBCu = dm.getGiaMuaTrungBinh() != null ? dm.getGiaMuaTrungBinh() : BigDecimal.ZERO;
            BigDecimal soLuongMoi = duLieu.getSoLuong();
            BigDecimal giaMoi = duLieu.getGia();

            BigDecimal tongSoLuong = soLuongCu.add(soLuongMoi);
            if (tongSoLuong.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal giaTBMoi = (soLuongCu.multiply(giaTBCu).add(soLuongMoi.multiply(giaMoi)))
                        .divide(tongSoLuong, 8, RoundingMode.HALF_UP);
                dm.setGiaMuaTrungBinh(giaTBMoi);
            }
            dm.setSoLuong(tongSoLuong);

        } else if ("sell".equalsIgnoreCase(duLieu.getLoai())) {
            BigDecimal soLuongCu = dm.getSoLuong() != null ? dm.getSoLuong() : BigDecimal.ZERO;
            BigDecimal soLuongBan = duLieu.getSoLuong();
            BigDecimal soLuongConLai = soLuongCu.subtract(soLuongBan);
            if (soLuongConLai.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Số lượng bán vượt quá số lượng hiện có.");
            }
            dm.setSoLuong(soLuongConLai);
        }

        danhMucCryptoRepository.save(dm);
        return giaoDichCryptoRepository.save(duLieu);
    }

    @Transactional
    public void xoaGiaoDich(UUID id) {
        giaoDichCryptoRepository.deleteById(id);
    }
}
