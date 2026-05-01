package com.meslite.domain.material;

import com.meslite.common.BaseEntity;
import com.meslite.domain.department.Department;
import com.meslite.domain.machine.Machine;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "materials")
public class Material extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_code", nullable = false, unique = true, length = 50)
    private String trackingCode;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_type", nullable = false, length = 50)
    private MaterialType materialType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_machine_id")
    private Machine currentMachine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_department_id")
    private Department currentDepartment;

    @Column(name = "total_input_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal totalInputQty = BigDecimal.ZERO;

    @Column(name = "total_output_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal totalOutputQty = BigDecimal.ZERO;

    @Column(name = "total_waste_qty", insertable = false, updatable = false, precision = 12, scale = 3)
    private BigDecimal totalWasteQty;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        updatedAt = OffsetDateTime.now();
    }
}

