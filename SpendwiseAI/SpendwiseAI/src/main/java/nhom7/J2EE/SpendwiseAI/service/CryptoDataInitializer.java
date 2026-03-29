package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import nhom7.J2EE.SpendwiseAI.repository.TaiSanCryptoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CryptoDataInitializer implements CommandLineRunner {

    private final TaiSanCryptoRepository taiSanCryptoRepository;

    @Override
    public void run(String... args) {
        if (taiSanCryptoRepository.count() == 0) {
            List<TaiSanCrypto> initialAssets = Arrays.asList(
                new TaiSanCrypto(null, "BTC", "Bitcoin"),
                new TaiSanCrypto(null, "ETH", "Ethereum"),
                new TaiSanCrypto(null, "USDT", "Tether"),
                new TaiSanCrypto(null, "BNB", "Binance Coin"),
                new TaiSanCrypto(null, "SOL", "Solana"),
                new TaiSanCrypto(null, "XRP", "Ripple"),
                new TaiSanCrypto(null, "USDC", "USD Coin"),
                new TaiSanCrypto(null, "ADA", "Cardano"),
                new TaiSanCrypto(null, "DOGE", "Dogecoin"),
                new TaiSanCrypto(null, "AVAX", "Avalanche"),
                new TaiSanCrypto(null, "DOT", "Polkadot"),
                new TaiSanCrypto(null, "MATIC", "Polygon"),
                new TaiSanCrypto(null, "TRX", "TRON"),
                new TaiSanCrypto(null, "LINK", "Chainlink"),
                new TaiSanCrypto(null, "PEPE", "Pepe"),
                new TaiSanCrypto(null, "SHIB", "Shiba Inu"),
                new TaiSanCrypto(null, "DAI", "Dai"),
                new TaiSanCrypto(null, "LTC", "Litecoin"),
                new TaiSanCrypto(null, "NEAR", "Near Protocol"),
                new TaiSanCrypto(null, "BCH", "Bitcoin Cash"),
                new TaiSanCrypto(null, "UNI", "Uniswap"),
                new TaiSanCrypto(null, "APT", "Aptos"),
                new TaiSanCrypto(null, "SUI", "Sui"),
                new TaiSanCrypto(null, "POL", "Polygon Ecosystem Token"),
                new TaiSanCrypto(null, "TON", "The Open Network")
            );
            taiSanCryptoRepository.saveAll(initialAssets);
            System.out.println(">>> Đã khởi tạo dữ liệu mẫu cho Crypto (TaiSanCrypto)");
        }
    }
}
