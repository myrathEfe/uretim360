package com.meslite.domain.machine;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MachineStatusLogRepository extends JpaRepository<MachineStatusLog, Long> {

    @EntityGraph(attributePaths = {"machine", "changedBy"})
    List<MachineStatusLog> findAllByMachineIdOrderByStartedAtDesc(Long machineId);

    Optional<MachineStatusLog> findFirstByMachineIdAndEndedAtIsNullOrderByStartedAtDesc(Long machineId);
}

