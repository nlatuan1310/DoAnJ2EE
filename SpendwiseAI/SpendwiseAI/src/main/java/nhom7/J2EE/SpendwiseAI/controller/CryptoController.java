package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.DanhMucCrypto;
import nhom7.J2EE.SpendwiseAI.entity.GiaoDichCrypto;
import nhom7.J2EE.SpendwiseAI.service.CryptoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/crypto")
@CrossOrigin("*")
public class CryptoController {

    private final CryptoService cryptoService;

    public CryptoController(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
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

    @PostMapping("/danh-muc")
    public ResponseEntity<DanhMucCrypto> them(
            @RequestParam UUID nguoiDungId,
            @RequestParam Integer taiSanId,
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

    @PostMapping("/giao-dich")
    public ResponseEntity<GiaoDichCrypto> ghiGiaoDich(
            @RequestParam UUID danhMucId,
            @RequestBody GiaoDichCrypto giaoDich) {
        return ResponseEntity.ok(cryptoService.ghiGiaoDich(danhMucId, giaoDich));
    }

    @DeleteMapping("/giao-dich/{id}")
    public ResponseEntity<Void> xoaGiaoDich(@PathVariable UUID id) {
        cryptoService.xoaGiaoDich(id);
        return ResponseEntity.noContent().build();
    }
}
