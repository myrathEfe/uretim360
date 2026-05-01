package com.meslite.domain.shift;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    @EntityGraph(attributePaths = {"supervisor", "supervisor.department"})
    List<Shift> findAllByOrderByStartTimeDesc();

    @EntityGraph(attributePaths = {"supervisor", "supervisor.department"})
    Optional<Shift> findById(Long id);

    boolean existsByIsActiveTrueAndStartTimeBeforeAndEndTimeIsNull(OffsetDateTime now);
}

