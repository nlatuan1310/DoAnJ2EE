package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.DanhMucCrypto;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDichCrypto;
import nhom7.J2EE.SpendwiseAI.service.CryptoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import nhom7.J2EE.SpendwiseAI.service.CryptoPriceService;

@RestController
@RequestMapping("/api/crypto")
@CrossOrigin("*")
public class CryptoController {

    private final CryptoService cryptoService;
    private final CryptoPriceService cryptoPriceService;

    public CryptoController(CryptoService cryptoService, CryptoPriceService cryptoPriceService) {
        this.cryptoService = cryptoService;
        this.cryptoPriceService = cryptoPriceService;
    }

    // ========================
    //  DANH MUC (Portfolio)
    // ========================

    @GetMapping("/danh-muc/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<DanhMucCrypto>> layPortfolioTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(cryptoService.layDanhMucTheoNguoiDung(nguoiDungId));
    }

    @GetMapping("/danh-muc/{id}")
    public ResponseEntity<DanhMucCrypto> layDanhMucTheoId(@PathVariable UUID id) {
        return ResponseEntity.ok(cryptoService.layDanhMucTheoId(id));
    }

    @PostMapping("/danh-muc/{nguoiDungId}/{taiSanId}")
    public ResponseEntity<DanhMucCrypto> them(
            @PathVariable UUID nguoiDungId,
            @PathVariable Integer taiSanId,
            @RequestBody DanhMucCrypto danhMucCrypto) {
        return ResponseEntity.ok(cryptoService.themVaoDanhMuc(nguoiDungId, taiSanId, danhMucCrypto));
    }

    @PutMapping("/danh-muc/{id}")
    public ResponseEntity<DanhMucCrypto> capNhat(
            @PathVariable UUID id,
            @RequestBody DanhMucCrypto danhMucCrypto) {
        return ResponseEntity.ok(cryptoService.capNhatDanhMuc(id, danhMucCrypto));
    }

    @DeleteMapping("/danh-muc/{id}")
    public ResponseEntity<Void> xoaDanhMuc(@PathVariable UUID id) {
        cryptoService.xoaDanhMuc(id);
        return ResponseEntity.noContent().build();
    }

    // ========================
    //  GIAO DICH (Transactions)
    // ========================

    @GetMapping("/giao-dich/danh-muc/{danhMucId}")
    public ResponseEntity<List<GiaoDichCrypto>> layGiaoDich(@PathVariable UUID danhMucId) {
        return ResponseEntity.ok(cryptoService.layGiaoDichTheoDanhMuc(danhMucId));
    }

    @PostMapping("/giao-dich/{danhMucId}")
    public ResponseEntity<?> ghiGiaoDich(
            @PathVariable UUID danhMucId,
            @RequestBody GiaoDichCrypto giaoDich) {
        try {
            return ResponseEntity.ok(cryptoService.ghiGiaoDich(danhMucId, giaoDich));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/giao-dich/{id}")
    public ResponseEntity<?> xoaGiaoDich(@PathVariable UUID id) {
        try {
            cryptoService.xoaGiaoDich(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ========================
    //  MARKET PRICES (Giá thị trường)
    // ========================

    @GetMapping("/market-prices")
    public ResponseEntity<Map<String, Map<String, Double>>> layGiaThiTruong(@RequestParam List<String> symbols) {
        return ResponseEntity.ok(cryptoPriceService.getMarketPrices(symbols));
    }
}
