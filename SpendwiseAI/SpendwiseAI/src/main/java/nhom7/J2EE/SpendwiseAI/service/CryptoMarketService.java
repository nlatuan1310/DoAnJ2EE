package nhom7.J2EE.SpendwiseAI.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
public class CryptoMarketService {

    private final RestTemplate restTemplate;

    @Value("${crypto.exchange-rate.usd-to-vnd:25400}")
    private double usdTovndRate;

    public CryptoMarketService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**

     * @param symbol Ký hiệu đồng coin, ví dụ: "BTC", "ETH"
     * @return Giá trị bằng VNĐ (sau khi quy đổi từ USDT)
     */
    public Double getMarketPriceInVND(String symbol) {
        try {
            // Binance yêu cầu symbol dạng BTCUSDT
            String binanceSymbol = symbol.toUpperCase() + "USDT";
            String url = "https://api.binance.com/api/v3/ticker/price?symbol=" + binanceSymbol;
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object priceObj = response.getBody().get("price");
                if (priceObj != null) {
                    double usdPrice = Double.parseDouble(priceObj.toString());
                    return usdPrice * usdTovndRate;
                }
            }
        } catch (Exception e) {
            // Log lỗi nếu cần, tạm thời trả về 0 để frontend biết lỗi
            System.err.println("Lỗi khi lấy giá thị trường cho " + symbol + ": " + e.getMessage());
        }
        
        return 0.0;
    }
}
