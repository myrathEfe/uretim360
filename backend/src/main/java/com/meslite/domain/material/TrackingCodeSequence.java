package com.meslite.domain.material;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tracking_code_sequences")
@IdClass(TrackingCodeSequence.TrackingCodeSequenceId.class)
public class TrackingCodeSequence {

    @Id
    @Column(name = "sector_prefix", nullable = false, length = 10)
    private String sectorPrefix;

    @Id
    @Column(nullable = false)
    private Integer year;

    @Column(name = "last_seq", nullable = false)
    private Integer lastSeq = 0;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TrackingCodeSequenceId implements Serializable {
        private String sectorPrefix;
        private Integer year;
    }
}

