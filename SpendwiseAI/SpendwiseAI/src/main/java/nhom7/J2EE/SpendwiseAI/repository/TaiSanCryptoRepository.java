package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.TaiSanCrypto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiSanCryptoRepository extends JpaRepository<TaiSanCrypto, Integer> {

    Optional<TaiSanCrypto> findByKyHieu(String kyHieu);

    Optional<TaiSanCrypto> findByCoingeckoId(String coingeckoId);
}
