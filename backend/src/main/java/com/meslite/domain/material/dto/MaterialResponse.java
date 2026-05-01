package com.meslite.domain.material.dto;

import com.meslite.domain.material.MaterialType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialResponse {
    private Long id;
    private String trackingCode;
    private String name;
    private MaterialType materialType;
    private Long currentMachineId;
    private String currentMachineName;
    private Long currentDepartmentId;
    private String currentDepartmentName;
    private BigDecimal totalInputQty;
    private BigDecimal totalOutputQty;
    private BigDecimal totalWasteQty;
    private Boolean isCompleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

