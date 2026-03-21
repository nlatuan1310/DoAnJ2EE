package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.DangKyDichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DangKyDichVuRepository extends JpaRepository<DangKyDichVu, UUID> {

    List<DangKyDichVu> findByNguoiDungId(UUID nguoiDungId);

    List<DangKyDichVu> findByNgayThanhToanTiepBefore(LocalDate ngay);
}
