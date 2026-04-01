package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.dto.ai.FinancialAdvisorDTO;
import nhom7.J2EE.SpendwiseAI.entity.CauHoiAI;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.entity.MucTieuTietKiem;
import nhom7.J2EE.SpendwiseAI.entity.NganSach;
import nhom7.J2EE.SpendwiseAI.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service RAG Financial Advisor — sử dụng Ollama (Llama) để tư vấn tài chính.
 *
 * RAG Pipeline:
 * 1. Retrieve: Truy vấn dữ liệu tài chính từ DB (giao dịch, ngân sách, mục tiêu, ví)
 * 2. Augment: Xây dựng prompt với context tài chính + câu hỏi của user
 * 3. Generate: Gọi Llama qua Ollama để sinh câu trả lời
 */
@Service
public class FinancialAdvisorService {

    private static final Logger log = LoggerFactory.getLogger(FinancialAdvisorService.class);

    private final ChatClient ollamaChatClient;
    private final GiaoDichRepository giaoDichRepository;
    private final ViTienRepository viTienRepository;
    private final NganSachRepository nganSachRepository;
    private final MucTieuTietKiemRepository mucTieuRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final CauHoiAIRepository cauHoiAIRepository;

    public FinancialAdvisorService(
            @Qualifier("ollamaChatClient") ChatClient ollamaChatClient,
            GiaoDichRepository giaoDichRepository,
            ViTienRepository viTienRepository,
            NganSachRepository nganSachRepository,
            MucTieuTietKiemRepository mucTieuRepository,
            NguoiDungRepository nguoiDungRepository,
            CauHoiAIRepository cauHoiAIRepository) {
        this.ollamaChatClient = ollamaChatClient;
        this.giaoDichRepository = giaoDichRepository;
        this.viTienRepository = viTienRepository;
        this.nganSachRepository = nganSachRepository;
        this.mucTieuRepository = mucTieuRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.cauHoiAIRepository = cauHoiAIRepository;
    }

    private static final int MAX_QUESTION_LENGTH = 1000;

    /**
     * Hỏi cố vấn tài chính AI — Main RAG entry point.
     */
    public FinancialAdvisorDTO.AdvisorResponse hoiCoVan(UUID userId, String cauHoi) {
        // Validate input
        if (cauHoi == null || cauHoi.trim().isEmpty()) {
            throw new IllegalArgumentException("Câu hỏi không được để trống.");
        }
        if (cauHoi.length() > MAX_QUESTION_LENGTH) {
            throw new IllegalArgumentException("Câu hỏi quá dài. Tối đa " + MAX_QUESTION_LENGTH + " ký tự.");
        }

        log.info("RAG Financial Advisor — User {} hỏi: {}", userId, cauHoi);

        // 1. RETRIEVE — Lấy dữ liệu tài chính từ DB
        FinancialAdvisorDTO.FinancialContext context = buildFinancialContext(userId);

        // 2. AUGMENT — Xây dựng prompt (system + user riêng biệt)
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(context, cauHoi);

        // 3. GENERATE — Gọi Llama qua Ollama
        String traLoi;
        try {
            traLoi = ollamaChatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();
            log.info("Ollama response length: {} chars", traLoi != null ? traLoi.length() : 0);
        } catch (Exception e) {
            log.error("Lỗi khi gọi Ollama: {}", e.getMessage(), e);
            traLoi = "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. " +
                     "Vui lòng kiểm tra kết nối đến máy chủ AI và thử lại sau.";
        }

        // 4. Lưu lịch sử vào CauHoiAI
        NguoiDung nguoiDung = nguoiDungRepository.findById(userId).orElse(null);
        CauHoiAI cauHoiAI = CauHoiAI.builder()
                .nguoiDung(nguoiDung)
                .cauHoi(cauHoi)
                .traLoi(traLoi)
                .build();
        cauHoiAI = cauHoiAIRepository.save(cauHoiAI);

        return FinancialAdvisorDTO.AdvisorResponse.builder()
                .id(cauHoiAI.getId())
                .cauHoi(cauHoi)
                .traLoi(traLoi)
                .ngayTao(cauHoiAI.getNgayTao())
                .build();
    }

    /**
     * Lấy lịch sử hội thoại.
     */
    public List<FinancialAdvisorDTO.AdvisorResponse> layLichSu(UUID userId) {
        return cauHoiAIRepository.findByNguoiDungIdOrderByNgayTaoDesc(userId)
                .stream()
                .map(c -> FinancialAdvisorDTO.AdvisorResponse.builder()
                        .id(c.getId())
                        .cauHoi(c.getCauHoi())
                        .traLoi(c.getTraLoi())
                        .ngayTao(c.getNgayTao())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Xóa một câu hỏi trong lịch sử — chỉ cho phép xóa câu hỏi của chính user.
     */
    public void xoaCauHoi(UUID id, UUID userId) {
        CauHoiAI cauHoi = cauHoiAIRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi."));

        if (cauHoi.getNguoiDung() == null || !cauHoi.getNguoiDung().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa câu hỏi này.");
        }

        cauHoiAIRepository.deleteById(id);
    }

    /**
     * Hỏi cố vấn tài chính AI — Streaming version (trả về từng token).
     */
    public Flux<String> hoiCoVanStream(UUID userId, String cauHoi) {
        // Validate input
        if (cauHoi == null || cauHoi.trim().isEmpty()) {
            return Flux.error(new IllegalArgumentException("Câu hỏi không được để trống."));
        }
        if (cauHoi.length() > MAX_QUESTION_LENGTH) {
            return Flux.error(new IllegalArgumentException("Câu hỏi quá dài. Tối đa " + MAX_QUESTION_LENGTH + " ký tự."));
        }

        log.info("RAG Financial Advisor (Stream) — User {} hỏi: {}", userId, cauHoi);

        // 1. RETRIEVE
        FinancialAdvisorDTO.FinancialContext context = buildFinancialContext(userId);

        // 2. AUGMENT
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(context, cauHoi);

        // 3. GENERATE — Stream từng token từ Ollama
        return ollamaChatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .stream()
                .content();
    }

    /**
     * Lưu lịch sử hội thoại (dùng sau khi stream hoàn tất).
     */
    public CauHoiAI luuLichSu(UUID userId, String cauHoi, String traLoi) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(userId).orElse(null);
        CauHoiAI cauHoiAI = CauHoiAI.builder()
                .nguoiDung(nguoiDung)
                .cauHoi(cauHoi)
                .traLoi(traLoi)
                .build();
        return cauHoiAIRepository.save(cauHoiAI);
    }

    // ========================================================================
    // PRIVATE — RAG Pipeline helpers
    // ========================================================================

    /**
     * RETRIEVE: Truy vấn tất cả dữ liệu tài chính liên quan của user.
     */
    private FinancialAdvisorDTO.FinancialContext buildFinancialContext(UUID userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // Tổng thu nhập & chi tiêu 30 ngày
        BigDecimal tongThuNhap = giaoDichRepository.sumByLoaiAndDate(userId, "income", thirtyDaysAgo);
        BigDecimal tongChiTieu = giaoDichRepository.sumByLoaiAndDate(userId, "expense", thirtyDaysAgo);

        // Tổng số dư ví
        BigDecimal soDuTongVi = viTienRepository.sumSoDuByUserId(userId);

        // Top danh mục chi tiêu
        List<Object[]> topCategories = giaoDichRepository.findTopExpenseCategories(userId, thirtyDaysAgo);
        List<String> topChiTieu = new ArrayList<>();
        int limit = Math.min(topCategories.size(), 5);
        for (int i = 0; i < limit; i++) {
            Object[] row = topCategories.get(i);
            String tenDM = row[0] != null ? row[0].toString() : "Không rõ";
            BigDecimal soTien = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            topChiTieu.add(tenDM + ": " + formatMoney(soTien));
        }

        // Thông tin ngân sách
        List<NganSach> nganSachs = nganSachRepository.findByNguoiDungId(userId);
        List<String> nganSachInfo = nganSachs.stream()
                .map(ns -> {
                    String tenDM = ns.getDanhMuc() != null ? ns.getDanhMuc().getTenDanhMuc() : "Chung";
                    return tenDM + " — Giới hạn: " + formatMoney(ns.getGioiHanTien())
                           + " (" + ns.getChuKy() + ")";
                })
                .collect(Collectors.toList());

        // Thông tin mục tiêu tiết kiệm
        List<MucTieuTietKiem> mucTieus = mucTieuRepository.findByNguoiDungId(userId);
        List<String> mucTieuInfo = mucTieus.stream()
                .map(mt -> {
                    BigDecimal phanTram = mt.getSoTienMucTieu().compareTo(BigDecimal.ZERO) > 0
                            ? mt.getSoTienHienTai().multiply(BigDecimal.valueOf(100))
                              .divide(mt.getSoTienMucTieu(), 1, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return mt.getTenMucTieu()
                           + " — " + formatMoney(mt.getSoTienHienTai())
                           + "/" + formatMoney(mt.getSoTienMucTieu())
                           + " (" + phanTram + "%)"
                           + (mt.getNgayMucTieu() != null ? " — Hạn: " + mt.getNgayMucTieu() : "");
                })
                .collect(Collectors.toList());

        return FinancialAdvisorDTO.FinancialContext.builder()
                .tongThuNhap(tongThuNhap)
                .tongChiTieu(tongChiTieu)
                .soDuTongVi(soDuTongVi)
                .topChiTieu(topChiTieu)
                .nganSachInfo(nganSachInfo)
                .mucTieuInfo(mucTieuInfo)
                .build();
    }

    /**
     * AUGMENT: Xây dựng system prompt (instruction cho AI).
     */
    private String buildSystemPrompt() {
        return """
                Bạn là một cố vấn tài chính cá nhân thông minh tên SpendWise AI. \
                Nhiệm vụ của bạn là phân tích dữ liệu tài chính thực tế của người dùng \
                và đưa ra lời khuyên cụ thể, hữu ích bằng tiếng Việt.

                Quy tắc:
                - Trả lời bằng tiếng Việt, rõ ràng và thân thiện
                - Dựa vào dữ liệu thực tế bên dưới để phân tích
                - Đưa ra lời khuyên cụ thể, có thể hành động được
                - Không bịa số liệu, chỉ dùng dữ liệu được cung cấp
                - Nếu thiếu dữ liệu, nói rõ và đưa lời khuyên chung
                - Sử dụng emoji phù hợp để làm câu trả lời sinh động
                - Nếu câu hỏi KHÔNG liên quan đến tài chính cá nhân, ngân sách, tiết kiệm, \
                đầu tư, chi tiêu hoặc quản lý tiền bạc, hãy lịch sự từ chối và nhắc người dùng \
                rằng bạn chỉ hỗ trợ về lĩnh vực tài chính. Tuyệt đối KHÔNG trả lời câu hỏi ngoài phạm vi.
                """;
    }

    /**
     * AUGMENT: Xây dựng user prompt với financial context + câu hỏi.
     */
    private String buildUserPrompt(FinancialAdvisorDTO.FinancialContext ctx, String cauHoi) {
        StringBuilder sb = new StringBuilder();

        // Financial context
        sb.append("=== DỮ LIỆU TÀI CHÍNH CỦA NGƯỜI DÙNG (30 ngày gần nhất) ===\n\n");

        BigDecimal thuNhap = nullSafe(ctx.getTongThuNhap());
        BigDecimal chiTieu = nullSafe(ctx.getTongChiTieu());

        sb.append("💰 Tổng thu nhập: ").append(formatMoney(thuNhap)).append("\n");
        sb.append("💸 Tổng chi tiêu: ").append(formatMoney(chiTieu)).append("\n");

        BigDecimal chenhLech = thuNhap.subtract(chiTieu);
        sb.append("📊 Chênh lệch (thu - chi): ").append(formatMoney(chenhLech)).append("\n");
        sb.append("🏦 Tổng số dư các ví: ").append(formatMoney(nullSafe(ctx.getSoDuTongVi()))).append("\n\n");

        if (ctx.getTopChiTieu() != null && !ctx.getTopChiTieu().isEmpty()) {
            sb.append("📋 Top danh mục chi tiêu:\n");
            ctx.getTopChiTieu().forEach(item -> sb.append("  - ").append(item).append("\n"));
            sb.append("\n");
        }

        if (ctx.getNganSachInfo() != null && !ctx.getNganSachInfo().isEmpty()) {
            sb.append("📌 Ngân sách đã thiết lập:\n");
            ctx.getNganSachInfo().forEach(item -> sb.append("  - ").append(item).append("\n"));
            sb.append("\n");
        }

        if (ctx.getMucTieuInfo() != null && !ctx.getMucTieuInfo().isEmpty()) {
            sb.append("🎯 Mục tiêu tiết kiệm:\n");
            ctx.getMucTieuInfo().forEach(item -> sb.append("  - ").append(item).append("\n"));
            sb.append("\n");
        }

        sb.append("=== CÂU HỎI CỦA NGƯỜI DÙNG ===\n");
        sb.append(cauHoi).append("\n");

        return sb.toString();
    }

    /**
     * Null-safe BigDecimal — trả về ZERO nếu null.
     */
    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    /**
     * Format số tiền cho dễ đọc.
     */
    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0 đ";
        return String.format("%,.0f đ", amount);
    }
}
