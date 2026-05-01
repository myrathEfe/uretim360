package com.meslite.domain.machine;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MachineRepository extends JpaRepository<Machine, Long> {

    @EntityGraph(attributePaths = {"department"})
    List<Machine> findAllByIsActiveTrueOrderByIdAsc();

    @EntityGraph(attributePaths = {"department"})
    Optional<Machine> findByIdAndIsActiveTrue(Long id);

    @EntityGraph(attributePaths = {"department"})
    List<Machine> findAllByDepartmentIdAndIsActiveTrueOrderByNameAsc(Long departmentId);

    @EntityGraph(attributePaths = {"department"})
    List<Machine> findAllByIdInAndIsActiveTrueOrderByNameAsc(Collection<Long> ids);

    @Query("select m from Machine m where m.isActive = true and m.department.id in :departmentIds order by m.name asc")
    @EntityGraph(attributePaths = {"department"})
    List<Machine> findAllByDepartmentIds(@Param("departmentIds") Collection<Long> departmentIds);
}

