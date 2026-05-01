package com.meslite.domain.production.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductionRecordResponse {
    private Long id;
    private Long materialId;
    private String materialTrackingCode;
    private Long machineId;
    private String machineName;
    private Long departmentId;
    private String departmentName;
    private Long shiftId;
    private String shiftName;
    private Long recordedByUserId;
    private String recordedByName;
    private BigDecimal inputQty;
    private BigDecimal outputQty;
    private BigDecimal wasteQty;
    private BigDecimal wasteRate;
    private String notes;
    private OffsetDateTime recordedAt;
}

