package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.ai.FinancialAdvisorDTO;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.service.FinancialAdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller cho tính năng Cố vấn Tài chính AI (RAG Financial Advisor).
 * Sử dụng Ollama (Llama) để tư vấn dựa trên dữ liệu tài chính thực của user.
 */
@RestController
@RequestMapping("/api/co-van-ai")
public class FinancialAdvisorController {

    private final FinancialAdvisorService advisorService;
    private final NguoiDungRepository nguoiDungRepository;

    public FinancialAdvisorController(FinancialAdvisorService advisorService,
                                       NguoiDungRepository nguoiDungRepository) {
        this.advisorService = advisorService;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Lấy userId từ Principal (JWT subject = email).
     */
    private UUID resolveUserId(Principal principal) {
        String email = principal.getName(); // JWT subject = email
        NguoiDung user = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + email));
        return user.getId();
    }

    /**
     * Gửi câu hỏi cho cố vấn AI.
     * POST /api/co-van-ai/hoi
     */
    @PostMapping("/hoi")
    public ResponseEntity<FinancialAdvisorDTO.AdvisorResponse> hoiCoVan(
            @RequestBody FinancialAdvisorDTO.QuestionRequest request,
            Principal principal) {

        UUID userId = resolveUserId(principal);
        FinancialAdvisorDTO.AdvisorResponse response =
                advisorService.hoiCoVan(userId, request.getCauHoi());
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch sử hội thoại.
     * GET /api/co-van-ai/lich-su
     */
    @GetMapping("/lich-su")
    public ResponseEntity<List<FinancialAdvisorDTO.AdvisorResponse>> layLichSu(
            Principal principal) {

        UUID userId = resolveUserId(principal);
        List<FinancialAdvisorDTO.AdvisorResponse> history = advisorService.layLichSu(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * Xóa một câu hỏi trong lịch sử.
     * DELETE /api/co-van-ai/lich-su/{id}
     */
    @DeleteMapping("/lich-su/{id}")
    public ResponseEntity<Void> xoaCauHoi(@PathVariable UUID id) {
        advisorService.xoaCauHoi(id);
        return ResponseEntity.noContent().build();
    }
}
