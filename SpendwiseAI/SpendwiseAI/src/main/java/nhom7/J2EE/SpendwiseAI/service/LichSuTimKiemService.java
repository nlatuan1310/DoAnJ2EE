package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.LichSuTimKiem;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.LichSuTimKiemRepository;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LichSuTimKiemService {

    private final LichSuTimKiemRepository lichSuTimKiemRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public LichSuTimKiemService(LichSuTimKiemRepository lichSuTimKiemRepository,
                                NguoiDungRepository nguoiDungRepository) {
        this.lichSuTimKiemRepository = lichSuTimKiemRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Lưu từ khoá tìm kiếm. Nếu từ khoá đã tồn tại thì cập nhật ngayTao
     * (đẩy lên đầu danh sách gần đây). Nếu chưa có thì insert mới.
     */
    @Transactional
    public void luuLichSu(UUID nguoiDungId, String tuKhoa, String boLoc) {
        if (tuKhoa == null || tuKhoa.trim().isEmpty()) {
            return; // Không lưu từ khoá rỗng
        }
        String trimmed = tuKhoa.trim();

        Optional<LichSuTimKiem> existing =
                lichSuTimKiemRepository.findByNguoiDungIdAndTuKhoa(nguoiDungId, trimmed);

        if (existing.isPresent()) {
            // Đã tìm kiếm từ khoá này trước đó → cập nhật timestamp để đẩy lên đầu
            LichSuTimKiem ls = existing.get();
            ls.setNgayTao(LocalDateTime.now());
            if (boLoc != null) {
                ls.setBoLoc(boLoc);
            }
            lichSuTimKiemRepository.save(ls);
        } else {
            // Từ khoá mới → tạo bản ghi mới
            NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + nguoiDungId));

            LichSuTimKiem ls = LichSuTimKiem.builder()
                    .nguoiDung(nguoiDung)
                    .tuKhoa(trimmed)
                    .boLoc(boLoc)
                    .build();
            lichSuTimKiemRepository.save(ls);
        }
    }

    /**
     * Lấy 10 từ khoá tìm kiếm gần đây nhất của người dùng.
     */
    public List<LichSuTimKiem> layLichSuGanDay(UUID nguoiDungId) {
        return lichSuTimKiemRepository.findTop10ByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId);
    }

    /**
     * Xoá 1 bản ghi lịch sử theo ID.
     */
    @Transactional
    public void xoa(UUID id) {
        lichSuTimKiemRepository.deleteById(id);
    }

    /**
     * Xoá toàn bộ lịch sử tìm kiếm của 1 người dùng.
     */
    @Transactional
    public void xoaTatCa(UUID nguoiDungId) {
        lichSuTimKiemRepository.deleteAllByNguoiDungId(nguoiDungId);
    }
}
