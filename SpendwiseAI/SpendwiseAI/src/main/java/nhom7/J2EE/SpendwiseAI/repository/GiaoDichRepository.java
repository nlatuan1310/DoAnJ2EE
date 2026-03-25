package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GiaoDichRepository extends JpaRepository<GiaoDich, UUID>, JpaSpecificationExecutor<GiaoDich> {

    List<GiaoDich> findByNguoiDungId(UUID nguoiDungId);

    List<GiaoDich> findByViTienId(UUID viId);

    List<GiaoDich> findByNguoiDungIdAndLoai(UUID nguoiDungId, String loai);

    List<GiaoDich> findByNguoiDungIdAndNgayGiaoDichBetween(
            UUID nguoiDungId, LocalDateTime tuNgay, LocalDateTime denNgay);

    List<GiaoDich> findByNguoiDungIdAndDanhMucId(UUID nguoiDungId, Integer danhMucId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(g.soTien) FROM GiaoDich g")
    java.math.BigDecimal tinhTongTienGiaoDich();

    long countByNgayGiaoDichBetween(LocalDateTime tuNgay, LocalDateTime denNgay);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT g.nguoiDung.id) FROM GiaoDich g WHERE g.ngayGiaoDich >= :tuNgay AND g.ngayGiaoDich <= :denNgay")
    long countActiveUsers(@org.springframework.data.repository.query.Param("tuNgay") LocalDateTime tuNgay, @org.springframework.data.repository.query.Param("denNgay") LocalDateTime denNgay);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(g.soTien) FROM GiaoDich g WHERE g.ngayGiaoDich >= :tuNgay AND g.ngayGiaoDich <= :denNgay")
    java.math.BigDecimal tinhTongTienGiaoDichKhoang(@org.springframework.data.repository.query.Param("tuNgay") LocalDateTime tuNgay, @org.springframework.data.repository.query.Param("denNgay") LocalDateTime denNgay);
}
