package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.DanhMuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DanhMucRepository extends JpaRepository<DanhMuc, Integer> {

    List<DanhMuc> findByNguoiDungId(UUID nguoiDungId);

    List<DanhMuc> findByNguoiDungIdAndLoai(UUID nguoiDungId, String loai);

    List<DanhMuc> findByIsSystemTrue();
}
