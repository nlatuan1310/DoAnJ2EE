package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import nhom7.J2EE.SpendwiseAI.repository.TaiSanCryptoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tai-san-crypto")
@CrossOrigin("*")
public class TaiSanCryptoController {

    private final TaiSanCryptoRepository taiSanCryptoRepository;

    public TaiSanCryptoController(TaiSanCryptoRepository taiSanCryptoRepository) {
        this.taiSanCryptoRepository = taiSanCryptoRepository;
    }

    @GetMapping
    public ResponseEntity<List<TaiSanCrypto>> layTatCa() {
        return ResponseEntity.ok(taiSanCryptoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaiSanCrypto> layTheoId(@PathVariable Integer id) {
        return taiSanCryptoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaiSanCrypto> tao(@RequestBody TaiSanCrypto taiSan) {
        return ResponseEntity.ok(taiSanCryptoRepository.save(taiSan));
    }
}
