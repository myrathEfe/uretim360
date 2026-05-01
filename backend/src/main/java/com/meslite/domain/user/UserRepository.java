package com.meslite.domain.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"department", "assignedMachines", "assignedMachines.department"})
    Optional<User> findByEmailAndIsActiveTrue(String email);

    @EntityGraph(attributePaths = {"department", "assignedMachines", "assignedMachines.department"})
    Optional<User> findByIdAndIsActiveTrue(Long id);

    @EntityGraph(attributePaths = {"department", "assignedMachines", "assignedMachines.department"})
    List<User> findAllByIsActiveTrueOrderByIdAsc();

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}

