package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.entity.TheTag;
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
    public ResponseEntity<List<TheTag>> layTheoNguoiDung(@PathVariable UUID nguoiDungId) {
        return ResponseEntity.ok(theTagService.layTheoNguoiDung(nguoiDungId));
    }

    @PostMapping("/nguoi-dung/{nguoiDungId}")
    public ResponseEntity<TheTag> tao(@PathVariable UUID nguoiDungId, @RequestBody TheTag tag) {
        return ResponseEntity.ok(theTagService.tao(nguoiDungId, tag));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable Integer id) {
        theTagService.xoa(id);
        return ResponseEntity.noContent().build();
    }
}
