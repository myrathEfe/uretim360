package com.meslite.domain.dashboard.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WasteMachineItem {
    private Long machineId;
    private String machineName;
    private String departmentName;
    private BigDecimal wasteRate;
    private String trend;
}

