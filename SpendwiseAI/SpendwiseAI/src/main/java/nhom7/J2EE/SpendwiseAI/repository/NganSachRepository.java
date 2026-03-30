package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.NganSach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NganSachRepository extends JpaRepository<NganSach, UUID> {

    List<NganSach> findByNguoiDungId(UUID nguoiDungId);

    List<NganSach> findByNguoiDungIdAndDanhMucId(UUID nguoiDungId, Integer danhMucId);

    List<NganSach> findByViTienId(UUID viId);

    @org.springframework.data.jpa.repository.Query("SELECT ns FROM NganSach ns WHERE ns.nguoiDung.id = :nguoiDungId " +
            "AND ns.danhMuc.id = :danhMucId " +
            "AND (ns.ngayBatDau <= :end AND ns.ngayKetThuc >= :start)")
    List<NganSach> findOverlappingBudgets(UUID nguoiDungId, Integer danhMucId, java.time.LocalDate start, java.time.LocalDate end);
}
