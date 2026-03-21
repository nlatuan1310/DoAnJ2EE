package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.TheTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TheTagRepository extends JpaRepository<TheTag, Integer> {

    List<TheTag> findByNguoiDungId(UUID nguoiDungId);
}
