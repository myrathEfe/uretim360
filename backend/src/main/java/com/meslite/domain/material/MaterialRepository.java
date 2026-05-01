package com.meslite.domain.material;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    @EntityGraph(attributePaths = {"currentMachine", "currentMachine.department", "currentDepartment"})
    List<Material> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = {"currentMachine", "currentMachine.department", "currentDepartment"})
    Optional<Material> findById(Long id);

    @EntityGraph(attributePaths = {"currentMachine", "currentMachine.department", "currentDepartment"})
    Optional<Material> findByTrackingCode(String trackingCode);
}

