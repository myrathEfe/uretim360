package com.meslite.domain.material;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

public interface TrackingCodeSequenceRepository extends JpaRepository<TrackingCodeSequence, TrackingCodeSequence.TrackingCodeSequenceId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TrackingCodeSequence> findBySectorPrefixAndYear(String sectorPrefix, Integer year);
}

