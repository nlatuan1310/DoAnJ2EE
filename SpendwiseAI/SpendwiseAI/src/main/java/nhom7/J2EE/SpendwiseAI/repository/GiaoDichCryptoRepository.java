package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDichCrypto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GiaoDichCryptoRepository extends JpaRepository<GiaoDichCrypto, UUID> {

    List<GiaoDichCrypto> findByDanhMucCryptoId(UUID danhMucCryptoId);
}
