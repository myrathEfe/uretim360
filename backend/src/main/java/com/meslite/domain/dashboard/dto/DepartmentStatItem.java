package com.meslite.domain.dashboard.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentStatItem {
    private Long departmentId;
    private String departmentName;
    private BigDecimal totalProduction;
    private BigDecimal totalWaste;
    private BigDecimal wasteRate;
}

