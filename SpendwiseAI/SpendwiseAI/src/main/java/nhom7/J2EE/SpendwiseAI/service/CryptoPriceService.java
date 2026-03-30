package nhom7.J2EE.SpendwiseAI.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CryptoPriceService {

    private final RestTemplate restTemplate;
    
    // Đơn giản hóa tỷ giá: 1 USD = 25,400 VND
    private static final double USD_VND_RATE = 25400.0;
    
    // Ánh xạ Ký hiệu (Symbol) -> CoinGecko ID
    private static final Map<String, String> SYMBOL_TO_ID = new HashMap<>();

    static {
        SYMBOL_TO_ID.put("BTC", "bitcoin");
        SYMBOL_TO_ID.put("ETH", "ethereum");
        SYMBOL_TO_ID.put("USDT", "tether");
        SYMBOL_TO_ID.put("BNB", "binancecoin");
        SYMBOL_TO_ID.put("SOL", "solana");
        SYMBOL_TO_ID.put("XRP", "ripple");
        SYMBOL_TO_ID.put("USDC", "usd-coin");
        SYMBOL_TO_ID.put("ADA", "cardano");
        SYMBOL_TO_ID.put("DOGE", "dogecoin");
        SYMBOL_TO_ID.put("AVAX", "avalanche-2");
        SYMBOL_TO_ID.put("DOT", "polkadot");
        SYMBOL_TO_ID.put("MATIC", "matic-network");
        SYMBOL_TO_ID.put("TRX", "tron");
        SYMBOL_TO_ID.put("LINK", "chainlink");
        SYMBOL_TO_ID.put("PEPE", "pepe");
    }

    public CryptoPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Lấy giá hiện tại cho danh sách các ký hiệu coin (gồm USD và VND).
     * @param symbols Danh sách ký hiệu (VD: ["BTC", "ETH"])
     * @return Map (Ký hiệu -> Map (usd -> giá, vnd -> giá))
     */
    public Map<String, Map<String, Double>> getMarketPrices(List<String> symbols) {
        Map<String, Map<String, Double>> result = new HashMap<>();
        
        // Handle case where symbols are sent as a single comma-separated string
        List<String> normalizedSymbols = symbols.stream()
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        List<String> ids = normalizedSymbols.stream()
                .map(s -> SYMBOL_TO_ID.get(s.toUpperCase()))
                .filter(id -> id != null)
                .collect(Collectors.toList());

        if (ids.isEmpty()) return result;

        String idsParam = String.join(",", ids);
        String url = String.format("https://api.coingecko.com/api/v3/simple/price?ids=%s&vs_currencies=usd", idsParam);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Map<String, Object>> response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                for (String symbol : normalizedSymbols) {
                    String id = SYMBOL_TO_ID.get(symbol.toUpperCase());
                    if (id != null && response.containsKey(id)) {
                        Map<String, Object> coinData = (Map<String, Object>) response.get(id);
                        Object usdPriceObj = coinData.get("usd");
                        
                        if (usdPriceObj != null) {
                            double usdPrice = Double.parseDouble(usdPriceObj.toString());
                            Map<String, Double> priceMap = new HashMap<>();
                            priceMap.put("usd", usdPrice);
                            priceMap.put("vnd", usdPrice * USD_VND_RATE);
                            
                            // Trả về cả Symbol (BTC) và ID (bitcoin) để frontend dễ tìm
                            result.put(symbol.toUpperCase(), priceMap);
                            result.put(id, priceMap);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi fetch giá từ CoinGecko: " + e.getMessage());
        }

        return result;
    }
}
