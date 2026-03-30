package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import nhom7.J2EE.SpendwiseAI.repository.TaiSanCryptoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CryptoDataInitializer implements CommandLineRunner {

    private final TaiSanCryptoRepository taiSanCryptoRepository;
    private final RestTemplate restTemplate;

    @Override
    public void run(String... args) {
        if (taiSanCryptoRepository.count() == 0) {
            List<TaiSanCrypto> assets = fetchTop25Coins();
            if (assets.isEmpty()) {
                System.out.println(">>> [WARNING] Không thể lấy dữ liệu từ API. Sử dụng danh sách dự phòng...");
                assets = getFallbackAssets();
            }
            taiSanCryptoRepository.saveAll(assets);
            System.out.println(">>> Đã khởi tạo dữ liệu cho Crypto (TaiSanCrypto) với " + assets.size() + " đồng coin.");
        }
    }

    private List<TaiSanCrypto> fetchTop25Coins() {
        List<TaiSanCrypto> assets = new ArrayList<>();
        try {
            String url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response != null) {
                for (Map<String, Object> coin : response) {
                    assets.add(TaiSanCrypto.builder()
                            .kyHieu(coin.get("symbol").toString().toUpperCase())
                            .ten(coin.get("name").toString())
                            .coingeckoId(coin.get("id").toString())
                            .build());
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi fetch data từ CoinGecko: " + e.getMessage());
        }
        return assets;
    }

    private List<TaiSanCrypto> getFallbackAssets() {
        return Arrays.asList(
            new TaiSanCrypto(null, "BTC", "Bitcoin", "bitcoin"),
            new TaiSanCrypto(null, "ETH", "Ethereum", "ethereum"),
            new TaiSanCrypto(null, "USDT", "Tether", "tether"),
            new TaiSanCrypto(null, "BNB", "Binance Coin", "binancecoin"),
            new TaiSanCrypto(null, "SOL", "Solana", "solana")
        );
    }
}
