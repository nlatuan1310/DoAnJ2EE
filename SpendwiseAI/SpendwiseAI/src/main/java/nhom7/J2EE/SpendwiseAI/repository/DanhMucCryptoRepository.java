package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.DanhMucCrypto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DanhMucCryptoRepository extends JpaRepository<DanhMucCrypto, UUID> {

    List<DanhMucCrypto> findByNguoiDungId(UUID nguoiDungId);
}
