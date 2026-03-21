package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.ThanhVienVi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThanhVienViRepository extends JpaRepository<ThanhVienVi, ThanhVienVi.ThanhVienViId> {

    List<ThanhVienVi> findByIdViId(UUID viId);

    List<ThanhVienVi> findByIdNguoiDungId(UUID nguoiDungId);
}
