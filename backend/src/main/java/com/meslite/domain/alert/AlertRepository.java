package com.meslite.domain.alert;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    @EntityGraph(attributePaths = {"machine", "machine.department", "material", "material.currentDepartment"})
    List<Alert> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"machine", "machine.department", "material", "material.currentDepartment"})
    Optional<Alert> findById(Long id);

    long countByIsReadFalse();

    boolean existsByAlertTypeAndMachineIdAndIsReadFalse(AlertType alertType, Long machineId);
}

