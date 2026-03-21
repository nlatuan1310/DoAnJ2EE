package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDichTags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GiaoDichTagsRepository extends JpaRepository<GiaoDichTags, GiaoDichTags.GiaoDichTagsId> {

    List<GiaoDichTags> findByIdGiaoDichId(UUID giaoDichId);

    List<GiaoDichTags> findByIdTagId(Integer tagId);
}
