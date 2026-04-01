package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.ai.FinancialAdvisorDTO;
import nhom7.J2EE.SpendwiseAI.entity.CauHoiAI;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import nhom7.J2EE.SpendwiseAI.service.FinancialAdvisorService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller cho tính năng Cố vấn Tài chính AI (RAG Financial Advisor).
 * Sử dụng Ollama (Llama) để tư vấn dựa trên dữ liệu tài chính thực của user.
 *
 * Hỗ trợ 2 chế độ:
 * - POST /hoi          → trả về cả cục (non-streaming)
 * - POST /hoi-stream   → trả về từng token (SSE streaming)
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
     * Gửi câu hỏi cho cố vấn AI (non-streaming).
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
     * Gửi câu hỏi cho cố vấn AI (SSE streaming — trả về từng token).
     * POST /api/co-van-ai/hoi-stream
     *
     * SSE Events:
     * - event: token,  data: "nội dung token"     → mỗi token từ AI
     * - event: done,   data: "uuid|ngayTao"        → khi stream hoàn tất (có ID lịch sử)
     * - event: error,  data: "thông báo lỗi"       → nếu có lỗi
     */
    @PostMapping(value = "/hoi-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter hoiCoVanStream(
            @RequestBody FinancialAdvisorDTO.QuestionRequest request,
            Principal principal) {

        UUID userId = resolveUserId(principal);
        String cauHoi = request.getCauHoi();

        // Timeout 2 phút (LLM có thể mất thời gian)
        SseEmitter emitter = new SseEmitter(120_000L);
        StringBuilder fullResponse = new StringBuilder();

        advisorService.hoiCoVanStream(userId, cauHoi)
                .subscribe(
                        // Mỗi token → gửi SSE event
                        token -> {
                            try {
                                fullResponse.append(token);
                                emitter.send(SseEmitter.event()
                                        .name("token")
                                        .data(token, MediaType.TEXT_PLAIN));
                            } catch (IOException e) {
                                emitter.completeWithError(e);
                            }
                        },
                        // Lỗi → gửi event error
                        error -> {
                            try {
                                emitter.send(SseEmitter.event()
                                        .name("error")
                                        .data("Xin lỗi, không thể kết nối AI. Vui lòng thử lại sau.",
                                                MediaType.TEXT_PLAIN));
                                emitter.complete();
                            } catch (IOException e) {
                                emitter.completeWithError(e);
                            }
                        },
                        // Hoàn tất → lưu lịch sử + gửi event done
                        () -> {
                            try {
                                CauHoiAI saved = advisorService.luuLichSu(
                                        userId, cauHoi, fullResponse.toString());
                                emitter.send(SseEmitter.event()
                                        .name("done")
                                        .data(saved.getId() + "|" + saved.getNgayTao(),
                                                MediaType.TEXT_PLAIN));
                                emitter.complete();
                            } catch (IOException e) {
                                emitter.completeWithError(e);
                            }
                        }
                );

        return emitter;
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
     * Xóa một câu hỏi trong lịch sử (chỉ cho phép xóa câu hỏi của chính mình).
     * DELETE /api/co-van-ai/lich-su/{id}
     */
    @DeleteMapping("/lich-su/{id}")
    public ResponseEntity<Void> xoaCauHoi(@PathVariable UUID id, Principal principal) {
        UUID userId = resolveUserId(principal);
        advisorService.xoaCauHoi(id, userId);
        return ResponseEntity.noContent().build();
    }
}
