package com.meslite.domain.dashboard.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SummaryCardResponse {
    private BigDecimal totalProduction;
    private BigDecimal totalWaste;
    private BigDecimal averageWasteRate;
    private Long faultyMachineCount;
}

