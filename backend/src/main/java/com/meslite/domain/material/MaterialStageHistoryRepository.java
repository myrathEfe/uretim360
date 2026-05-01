package com.meslite.domain.material;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialStageHistoryRepository extends JpaRepository<MaterialStageHistory, Long> {

    @EntityGraph(attributePaths = {"machine", "department", "productionRecord"})
    List<MaterialStageHistory> findAllByMaterialIdOrderByEnteredAtAsc(Long materialId);

    List<MaterialStageHistory> findAllByProductionRecordId(Long productionRecordId);

    void deleteAllByMaterialId(Long materialId);

    Optional<MaterialStageHistory> findFirstByMaterialIdAndLeftAtIsNullOrderByEnteredAtDesc(Long materialId);
}
