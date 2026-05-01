package com.meslite.domain.material.dto;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialHistoryResponse {
    private Long id;
    private Long machineId;
    private String machineName;
    private Long departmentId;
    private String departmentName;
    private OffsetDateTime enteredAt;
    private OffsetDateTime leftAt;
    private Long productionRecordId;
}

