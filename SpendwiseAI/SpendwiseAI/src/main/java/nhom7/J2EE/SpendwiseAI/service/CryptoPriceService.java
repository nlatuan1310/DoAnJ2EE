package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.repository.TaiSanCryptoRepository;
import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CryptoPriceService {

    private final RestTemplate restTemplate;
    private final CryptoMarketService cryptoMarketService;
    private final TaiSanCryptoRepository taiSanCryptoRepository;
    
    @Value("${crypto.exchange-rate.usd-to-vnd:25400}")
    private double usdVndRate;
    
    // Cache: 60 seconds TTL
    private static final long CACHE_TTL_MS = 60000;
    private final Map<String, CachedPrice> priceCache = new java.util.concurrent.ConcurrentHashMap<>();

    private static class CachedPrice {
        Map<String, Double> prices;
        long timestamp;

        CachedPrice(Map<String, Double> prices) {
            this.prices = prices;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL_MS;
        }
    }
    
    // Ánh xạ Ký hiệu (Symbol) -> CoinGecko ID (Dùng làm fallback hoặc cho các đồng mặc định)
    private static final Map<String, String> SYMBOL_TO_ID = new HashMap<>();

    static {
        // Chỉ giữ lại các đồng coin cốt lõi làm fallback an toàn
        SYMBOL_TO_ID.put("BTC", "bitcoin");
        SYMBOL_TO_ID.put("ETH", "ethereum");
        SYMBOL_TO_ID.put("USDT", "tether");
        SYMBOL_TO_ID.put("BNB", "binancecoin");
        SYMBOL_TO_ID.put("SOL", "solana");
    }

    public CryptoPriceService(RestTemplate restTemplate, CryptoMarketService cryptoMarketService, TaiSanCryptoRepository taiSanCryptoRepository) {
        this.restTemplate = restTemplate;
        this.cryptoMarketService = cryptoMarketService;
        this.taiSanCryptoRepository = taiSanCryptoRepository;
    }

    private String getCoinGeckoId(String symbol) {
        // 1. Kiểm tra trong DB trước
        return taiSanCryptoRepository.findByKyHieu(symbol.toUpperCase())
                .map(TaiSanCrypto::getCoingeckoId)
                .orElse(SYMBOL_TO_ID.get(symbol.toUpperCase()));
    }

    /**
     * Lấy giá hiện tại cho danh sách các ký hiệu coin (gồm USD và VND).
     * @param symbols Danh sách ký hiệu (VD: ["BTC", "ETH"])
     * @return Map (Ký hiệu -> Map (usd -> giá, vnd -> giá))
     */
    public Map<String, Map<String, Double>> getMarketPrices(List<String> symbols) {
        Map<String, Map<String, Double>> result = new HashMap<>();
        
        // Normalize symbols
        List<String> normalizedSymbols = symbols.stream()
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        List<String> symbolsToFetch = new ArrayList<>();

        // 1. Check cache first
        for (String symbol : normalizedSymbols) {
            CachedPrice cached = priceCache.get(symbol);
            if (cached != null && !cached.isExpired()) {
                result.put(symbol, cached.prices);
            } else {
                symbolsToFetch.add(symbol);
            }
        }

        if (symbolsToFetch.isEmpty()) return result;

        // 2. Fetch from External API (CoinGecko)
        List<String> idsToFetch = symbolsToFetch.stream()
                .map(this::getCoinGeckoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (!idsToFetch.isEmpty()) {
            fetchFromCoinGecko(idsToFetch, result);
        }

        // 3. Fallback to Binance for missing symbols or if CoinGecko failed
        for (String symbol : symbolsToFetch) {
            if (!result.containsKey(symbol)) {
                fetchFromBinance(symbol, result);
            }
        }

        // 4. Update cache
        for (String symbol : normalizedSymbols) {
            if (result.containsKey(symbol)) {
                priceCache.put(symbol, new CachedPrice(result.get(symbol)));
            }
        }

        return result;
    }

    private void fetchFromCoinGecko(List<String> ids, Map<String, Map<String, Double>> result) {
        String idsParam = String.join(",", ids);
        String url = String.format("https://api.coingecko.com/api/v3/simple/price?ids=%s&vs_currencies=usd", idsParam);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Map<String, Object>> response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                // Chúng ta sẽ duyệt qua các ID được trả về từ response thay vì duyệt qua Symbol Map cố định
                for (String id : response.keySet()) {
                    Map<String, Object> coinData = (Map<String, Object>) response.get(id);
                    Object usdPriceObj = coinData.get("usd");
                    
                    if (usdPriceObj != null) {
                        double usdPrice = Double.parseDouble(usdPriceObj.toString());
                        Map<String, Double> priceMap = new HashMap<>();
                        priceMap.put("usd", usdPrice);
                        priceMap.put("vnd", usdPrice * usdVndRate);
                        
                        // Ánh xạ lại kết quả cho cả ID và Symbol tương ứng
                        result.put(id, priceMap);
                        
                        // Tìm symbol tương ứng với ID này để lưu vào result
                        taiSanCryptoRepository.findByCoingeckoId(id).ifPresent(asset -> {
                            result.put(asset.getKyHieu(), priceMap);
                        });
                    }
                }
            }
        } catch (Exception e) {
            if (e.getMessage().contains("429")) {
                System.out.println(">>> [INFO] CoinGecko giới hạn lượt gọi (Rate Limit). Hệ thống đang tự động chuyển sang dùng Binance làm dự phòng...");
            } else {
                System.err.println("Lỗi khi fetch giá từ CoinGecko: " + e.getMessage());
            }
        }
    }

    private void fetchFromBinance(String symbol, Map<String, Map<String, Double>> result) {
        try {
            // CryptoMarketService đã có logic quy đổi ra VND, chúng ta lấy về và chia lại để có USD
            Double priceVnd = cryptoMarketService.getMarketPriceInVND(symbol);
            if (priceVnd != null && priceVnd > 0) {
                double usdPrice = priceVnd / usdVndRate;
                Map<String, Double> priceMap = new HashMap<>();
                priceMap.put("usd", usdPrice);
                priceMap.put("vnd", priceVnd);
                result.put(symbol, priceMap);
                
                // Cũng ánh xạ ID nếu có để đồng bộ
                String id = getCoinGeckoId(symbol);
                if (id != null) {
                    result.put(id, priceMap);
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi fallback sang Binance cho " + symbol + ": " + e.getMessage());
        }
    }
}
