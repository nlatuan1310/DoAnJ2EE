package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GiaoDichRepository extends JpaRepository<GiaoDich, UUID> {

    List<GiaoDich> findByNguoiDungId(UUID nguoiDungId);

    List<GiaoDich> findByViTienId(UUID viId);

    List<GiaoDich> findByNguoiDungIdAndLoai(UUID nguoiDungId, String loai);

    List<GiaoDich> findByNguoiDungIdAndNgayGiaoDichBetween(
            UUID nguoiDungId, LocalDateTime tuNgay, LocalDateTime denNgay);

    List<GiaoDich> findByNguoiDungIdAndDanhMucId(UUID nguoiDungId, Integer danhMucId);
}
