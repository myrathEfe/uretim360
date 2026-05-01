package com.meslite.domain.production;

import com.meslite.domain.machine.MachineStatus;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductionRecordRepository extends JpaRepository<ProductionRecord, Long> {

    @EntityGraph(attributePaths = {"material", "machine", "machine.department", "department", "shift", "recordedBy"})
    List<ProductionRecord> findAllByOrderByRecordedAtDesc();

    @EntityGraph(attributePaths = {"material", "machine", "machine.department", "department", "shift", "recordedBy"})
    List<ProductionRecord> findAllByDepartmentIdOrderByRecordedAtDesc(Long departmentId);

    @EntityGraph(attributePaths = {"material", "machine", "machine.department", "department", "shift", "recordedBy"})
    List<ProductionRecord> findAllByMachineIdInOrderByRecordedAtDesc(Collection<Long> machineIds);

    @EntityGraph(attributePaths = {"material", "machine", "machine.department", "department", "shift", "recordedBy"})
    Optional<ProductionRecord> findById(Long id);

    @EntityGraph(attributePaths = {"material", "machine", "machine.department", "department", "shift", "recordedBy"})
    List<ProductionRecord> findAllByMaterialIdOrderByRecordedAtAsc(Long materialId);

    boolean existsByShiftId(Long shiftId);

    List<ProductionRecord> findAllByRecordedAtBetweenOrderByRecordedAtAsc(OffsetDateTime start, OffsetDateTime end);

    @Query("""
            select pr from ProductionRecord pr
            join fetch pr.machine m
            join fetch m.department d
            where pr.recordedAt between :start and :end
            order by pr.recordedAt asc
            """)
    List<ProductionRecord> findForDashboardRange(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);
}
