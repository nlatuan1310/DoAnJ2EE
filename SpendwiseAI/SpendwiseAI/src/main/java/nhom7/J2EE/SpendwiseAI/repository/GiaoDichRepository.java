package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    // === RAG Financial Advisor queries ===

    @Query("SELECT COALESCE(SUM(g.soTien), 0) FROM GiaoDich g " +
           "WHERE g.nguoiDung.id = :userId AND g.loai = :loai " +
           "AND g.ngayGiaoDich >= :fromDate")
    BigDecimal sumByLoaiAndDate(@Param("userId") UUID userId,
                                @Param("loai") String loai,
                                @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT g.danhMuc.tenDanhMuc, SUM(g.soTien) FROM GiaoDich g " +
           "WHERE g.nguoiDung.id = :userId AND g.loai = 'expense' " +
           "AND g.ngayGiaoDich >= :fromDate " +
           "GROUP BY g.danhMuc.tenDanhMuc ORDER BY SUM(g.soTien) DESC")
    List<Object[]> findTopExpenseCategories(@Param("userId") UUID userId,
                                            @Param("fromDate") LocalDateTime fromDate);
}

