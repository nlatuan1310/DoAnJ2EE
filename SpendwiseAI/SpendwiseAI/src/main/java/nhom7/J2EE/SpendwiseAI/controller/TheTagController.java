package nhom7.J2EE.SpendwiseAI.controller;

import jakarta.validation.Valid;
import nhom7.J2EE.SpendwiseAI.dto.TheTagDTO;
import nhom7.J2EE.SpendwiseAI.service.TheTagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/the-tag")
public class TheTagController {

    private final TheTagService theTagService;

    public TheTagController(TheTagService theTagService) {
        this.theTagService = theTagService;
    }

    @GetMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<List<TheTagDTO.TheTagResponse>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(theTagService.layTheoNguoiDung(nguoiDungId));
    }

    @PostMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<TheTagDTO.TheTagResponse> tao(@PathVariable UUID nguoiDungId, 
                                                       @Valid @RequestBody TheTagDTO.TheTagRequest request) {
        return ResponseEntity.ok(theTagService.tao(nguoiDungId, request));
    }

    @PutMapping("/{id}/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<TheTagDTO.TheTagResponse> capNhat(@PathVariable Integer id, 
                                                           @PathVariable UUID nguoiDungId,
                                                           @Valid @RequestBody TheTagDTO.TheTagRequest request) {
        return ResponseEntity.ok(theTagService.capNhat(id, nguoiDungId, request));
    }

    @DeleteMapping("/{id}/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<Void> xoa(@PathVariable Integer id, @PathVariable UUID nguoiDungId) {
        theTagService.xoa(id, nguoiDungId);
        return ResponseEntity.noContent().build();
    }
}

