package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.ViTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ViTienRepository extends JpaRepository<ViTien, UUID> {

    List<ViTien> findByChuSoHuuId(UUID chuSoHuuId);
    
    @Query("SELECT v FROM ViTien v JOIN FETCH v.chuSoHuu WHERE v.chuSoHuu.id = :userId OR EXISTS (SELECT 1 FROM ThanhVienVi tv WHERE tv.viTien = v AND tv.nguoiDung.id = :userId)")
    List<ViTien> findAccessibleWallets(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(v.soDu), 0) FROM ViTien v WHERE v.chuSoHuu.id = :userId")
    BigDecimal sumSoDuByUserId(@Param("userId") UUID userId);
}

