package com.meslite.domain.production;

import com.meslite.domain.department.Department;
import com.meslite.domain.machine.Machine;
import com.meslite.domain.material.Material;
import com.meslite.domain.shift.Shift;
import com.meslite.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "production_records")
public class ProductionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @Column(name = "input_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal inputQty;

    @Column(name = "output_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal outputQty;

    @Column(name = "waste_qty", insertable = false, updatable = false, precision = 12, scale = 3)
    private BigDecimal wasteQty;

    @Column(name = "waste_rate", insertable = false, updatable = false, precision = 6, scale = 3)
    private BigDecimal wasteRate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt;

    @PrePersist
    public void prePersist() {
        if (recordedAt == null) {
            recordedAt = OffsetDateTime.now();
        }
    }
}

