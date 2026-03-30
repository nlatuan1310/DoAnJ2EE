package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.LichSuTimKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LichSuTimKiemRepository extends JpaRepository<LichSuTimKiem, UUID> {

    List<LichSuTimKiem> findByNguoiDungIdOrderByNgayTaoDesc(UUID nguoiDungId);

    List<LichSuTimKiem> findTop10ByNguoiDungIdOrderByNgayTaoDesc(UUID nguoiDungId);

    Optional<LichSuTimKiem> findByNguoiDungIdAndTuKhoa(UUID nguoiDungId, String tuKhoa);

    void deleteAllByNguoiDungId(UUID nguoiDungId);
}
