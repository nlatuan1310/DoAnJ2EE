package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.DanhMucCrypto;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDichCrypto;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import nhom7.J2EE.SpendwiseAI.repository.DanhMucCryptoRepository;
import nhom7.J2EE.SpendwiseAI.repository.GiaoDichCryptoRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.repository.TaiSanCryptoRepository;
import org.springframework.beans.factory.annotation.Value;
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
    private final ViTienService viTienService;
    private final nhom7.J2EE.SpendwiseAI.repository.ViTienRepository viTienRepository;
    
    @Value("${crypto.exchange-rate.usd-to-vnd:25400}")
    private double usdVndRate;

    public CryptoService(DanhMucCryptoRepository danhMucCryptoRepository,
                         GiaoDichCryptoRepository giaoDichCryptoRepository,
                         NguoiDungRepository nguoiDungRepository,
                         TaiSanCryptoRepository taiSanCryptoRepository,
                         ViTienService viTienService,
                         nhom7.J2EE.SpendwiseAI.repository.ViTienRepository viTienRepository) {
        this.danhMucCryptoRepository = danhMucCryptoRepository;
        this.giaoDichCryptoRepository = giaoDichCryptoRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.taiSanCryptoRepository = taiSanCryptoRepository;
        this.viTienService = viTienService;
        this.viTienRepository = viTienRepository;
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

    /**
     * Tính toán lại số lượng và giá trung bình cho một danh mục dựa trên lịch sử giao dịch.
     */
    @Transactional
    public void tinhLaiPortfolio(UUID danhMucId) {
        DanhMucCrypto dm = layDanhMucTheoId(danhMucId);
        List<GiaoDichCrypto> history = giaoDichCryptoRepository.findByDanhMucCryptoId(danhMucId);

        BigDecimal currentQty = BigDecimal.ZERO;
        BigDecimal avgPrice = BigDecimal.ZERO;

        // Sắp xếp lịch sử theo thời gian để tính Avg Price chính xác
        history.sort((a,b) -> a.getNgayGiaoDich().compareTo(b.getNgayGiaoDich()));

        for (GiaoDichCrypto tx : history) {
            BigDecimal txGia = tx.getGia();
            // CHUẨN HÓA VỀ VND: Nếu giao dịch là USD, quy đổi sang VND để tính Avg Price đồng nhất
            if ("USD".equalsIgnoreCase(tx.getTienTe())) {
                txGia = txGia.multiply(BigDecimal.valueOf(usdVndRate));
            }

            if ("buy".equalsIgnoreCase(tx.getLoai())) {
                BigDecimal oldTotalCost = currentQty.multiply(avgPrice);
                BigDecimal newTxCost = tx.getSoLuong().multiply(txGia);
                currentQty = currentQty.add(tx.getSoLuong());
                if (currentQty.compareTo(BigDecimal.ZERO) > 0) {
                    avgPrice = oldTotalCost.add(newTxCost).divide(currentQty, 8, RoundingMode.HALF_UP);
                }
            } else if ("sell".equalsIgnoreCase(tx.getLoai())) {
                currentQty = currentQty.subtract(tx.getSoLuong());
                if (currentQty.compareTo(BigDecimal.ZERO) <= 0) {
                    avgPrice = BigDecimal.ZERO;
                }
            }
        }

        dm.setSoLuong(currentQty);
        dm.setGiaMuaTrungBinh(avgPrice);
        danhMucCryptoRepository.save(dm);
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

        // Lưu danh mục trước
        DanhMucCrypto savedDm = danhMucCryptoRepository.save(duLieu);

        // NẾU CÓ SỐ LƯỢNG BAN ĐẦU > 0, TỰ ĐỘNG TẠO GIAO DỊCH 'BUY' ĐỂ LỊCH SỬ CHÍNH XÁC
        if (savedDm.getSoLuong().compareTo(BigDecimal.ZERO) > 0) {
            GiaoDichCrypto initialTx = GiaoDichCrypto.builder()
                    .danhMucCrypto(savedDm)
                    .loai("buy")
                    .soLuong(savedDm.getSoLuong())
                    .gia(savedDm.getGiaMuaTrungBinh())
                    .ngayGiaoDich(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0)) 
                    .viId(duLieu.getViId()) 
                    .tienTe(duLieu.getTienTe()) // Set loại tiền từ frontend
                    .build();

            // Cập nhật ví tiền nếu có link viId (Khấu trừ vốn đầu tư ban đầu)
            if (initialTx.getViId() != null) {
                BigDecimal totalAmount = initialTx.getSoLuong().multiply(initialTx.getGia());
                capNhatSoDuVi(initialTx.getViId(), totalAmount, initialTx.getTienTe(), "buy");
            }

            giaoDichCryptoRepository.save(initialTx);
        }

        // Tính toán lại Portfolio (thực ra không cần nếu vừa tạo nhưng để chắc chắn)
        tinhLaiPortfolio(savedDm.getId());

        return savedDm;
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

    private void capNhatSoDuVi(UUID viId, BigDecimal amount, String txCurrency, String type) {
        if (viId == null) return;
        nhom7.J2EE.SpendwiseAI.entity.ViTien vi = viTienService.layTheoId(viId);
        
        String walletCurrency = vi.getTienTe() != null ? vi.getTienTe().toUpperCase() : "VND";
        String transactionCurrency = txCurrency != null ? txCurrency.toUpperCase() : "USD";
        
        BigDecimal amountToUpdate = amount;

        // Xử lý quy đổi tỷ giá
        if (!walletCurrency.equals(transactionCurrency)) {
            if ("USD".equals(transactionCurrency) && "VND".equals(walletCurrency)) {
                // Nhập giá USD, ví là VND -> Nhân tỷ giá
                amountToUpdate = amount.multiply(BigDecimal.valueOf(usdVndRate)).setScale(0, RoundingMode.HALF_UP);
            } else if ("VND".equals(transactionCurrency) && "USD".equals(walletCurrency)) {
                // Nhập giá VND, ví là USD -> Chia tỷ giá
                amountToUpdate = amount.divide(BigDecimal.valueOf(usdVndRate), 2, RoundingMode.HALF_UP);
            }
        }

        if ("buy".equalsIgnoreCase(type)) {
            if (vi.getSoDu().compareTo(amountToUpdate) < 0) {
                throw new RuntimeException("Số dư ví (" + vi.getTenVi() + ") không đủ. Cần: " + 
                        amountToUpdate + " " + walletCurrency + ", Hiện có: " + vi.getSoDu() + " " + walletCurrency);
            }
            vi.setSoDu(vi.getSoDu().subtract(amountToUpdate));
        } else {
            vi.setSoDu(vi.getSoDu().add(amountToUpdate));
        }
        viTienRepository.save(vi);
    }

    @Transactional
    public GiaoDichCrypto ghiGiaoDich(UUID danhMucId, GiaoDichCrypto duLieu) {
        DanhMucCrypto dm = layDanhMucTheoId(danhMucId);
        duLieu.setDanhMucCrypto(dm);
        if (duLieu.getNgayGiaoDich() == null) duLieu.setNgayGiaoDich(LocalDateTime.now());

        // Ràng buộc khi bán: không được bán vượt quá số lượng hiện có
        if ("sell".equalsIgnoreCase(duLieu.getLoai())) {
            BigDecimal currentQty = dm.getSoLuong() != null ? dm.getSoLuong() : BigDecimal.ZERO;
            if (duLieu.getSoLuong().compareTo(currentQty) > 0) {
                throw new RuntimeException("Số lượng bán vượt quá số lượng đang nắm giữ (" + currentQty + ").");
            }
        }

        // Cập nhật ví tiền nếu có link viId
        if (duLieu.getViId() != null) {
            BigDecimal totalAmount = duLieu.getSoLuong().multiply(duLieu.getGia());
            capNhatSoDuVi(duLieu.getViId(), totalAmount, duLieu.getTienTe(), duLieu.getLoai());
        }

        // Lưu giao dịch trước khi tính lại
        GiaoDichCrypto savedTx = giaoDichCryptoRepository.save(duLieu);

        // Tính toán lại Portfolio
        tinhLaiPortfolio(danhMucId);

        return savedTx;
    }

    @Transactional
    public void xoaGiaoDich(UUID id) {
        GiaoDichCrypto tx = giaoDichCryptoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại: " + id));
        UUID danhMucId = tx.getDanhMucCrypto().getId();

        // Hoàn tiền lại cho ví (Trình tự ngược lại của Buy/Sell)
        if (tx.getViId() != null) {
            BigDecimal totalAmount = tx.getSoLuong().multiply(tx.getGia());
            // Nếu là Buy, xóa đi nghĩa là cộng lại tiền. Nếu là Sell, xóa đi nghĩa là trừ lại tiền.
            String reverseType = "buy".equalsIgnoreCase(tx.getLoai()) ? "sell" : "buy";
            capNhatSoDuVi(tx.getViId(), totalAmount, tx.getTienTe(), reverseType);
        }

        giaoDichCryptoRepository.deleteById(id);
        
        // Tính lại Portfolio sau khi xóa lịch sử
        tinhLaiPortfolio(danhMucId);
    }
}
