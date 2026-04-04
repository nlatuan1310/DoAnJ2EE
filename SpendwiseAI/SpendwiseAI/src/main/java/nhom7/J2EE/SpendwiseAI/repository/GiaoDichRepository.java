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
    
    org.springframework.data.domain.Page<GiaoDich> findByNguoiDungIdAndHinhAnhUrlIsNotNull(UUID nguoiDungId, org.springframework.data.domain.Pageable pageable);

    List<GiaoDich> findByViTienId(UUID viId);

    List<GiaoDich> findByViTienIdIn(List<UUID> viIds);

    List<GiaoDich> findByNguoiDungIdAndLoai(UUID nguoiDungId, String loai);

    List<GiaoDich> findByNguoiDungIdAndNgayGiaoDichBetween(
            UUID nguoiDungId, LocalDateTime tuNgay, LocalDateTime denNgay);

    List<GiaoDich> findByNguoiDungIdAndViTienIdAndNgayGiaoDichBetween(
            UUID nguoiDungId, UUID viTienId, LocalDateTime tuNgay, LocalDateTime denNgay);

    List<GiaoDich> findByNguoiDungIdAndDanhMucId(UUID nguoiDungId, Integer danhMucId);

    @org.springframework.data.jpa.repository.Query("SELECT gd.danhMuc.id, gd.danhMuc.tenDanhMuc, gd.danhMuc.mauSac, gd.danhMuc.icon, SUM(gd.soTien) " +
            "FROM GiaoDich gd " +
            "WHERE gd.nguoiDung.id = :nguoiDungId AND gd.ngayGiaoDich BETWEEN :tuNgay AND :denNgay AND gd.loai = 'expense' " +
            "GROUP BY gd.danhMuc.id, gd.danhMuc.tenDanhMuc, gd.danhMuc.mauSac, gd.danhMuc.icon")
    List<Object[]> thongKeTheoDanhMuc(UUID nguoiDungId, LocalDateTime tuNgay, LocalDateTime denNgay);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(gd.ngayGiaoDich AS date), SUM(gd.soTien) " +
            "FROM GiaoDich gd " +
            "WHERE gd.nguoiDung.id = :nguoiDungId AND gd.ngayGiaoDich BETWEEN :tuNgay AND :denNgay AND gd.loai = 'expense' " +
            "GROUP BY CAST(gd.ngayGiaoDich AS date) " +
            "ORDER BY CAST(gd.ngayGiaoDich AS date)")
    List<Object[]> thongKeTheoNgay(UUID nguoiDungId, LocalDateTime tuNgay, LocalDateTime denNgay);
  
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

    // === Admin System-wide Statistics ===
    @Query("SELECT COALESCE(SUM(g.soTien), 0) FROM GiaoDich g")
    BigDecimal tongLuanChuyenHeThong();

    @Query("SELECT COUNT(DISTINCT g.nguoiDung.id) FROM GiaoDich g WHERE g.ngayGiaoDich >= :fromDate")
    long countDistinctActiveUsers(@Param("fromDate") LocalDateTime fromDate);

    long countByNgayGiaoDichBetween(LocalDateTime tuNgay, LocalDateTime denNgay);

    @Query("SELECT FUNCTION('TO_CHAR', g.ngayGiaoDich, 'YYYY-MM'), COUNT(g) FROM GiaoDich g " +
           "WHERE g.ngayGiaoDich >= :fromDate GROUP BY FUNCTION('TO_CHAR', g.ngayGiaoDich, 'YYYY-MM') " +
           "ORDER BY FUNCTION('TO_CHAR', g.ngayGiaoDich, 'YYYY-MM')")
    List<Object[]> countGiaoDichTheoThang(@Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT g FROM GiaoDich g ORDER BY g.ngayTao DESC")
    List<GiaoDich> findRecentGiaoDich(org.springframework.data.domain.Pageable pageable);
}

