package com.meslite.domain.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductionTrendItem {
    private LocalDate date;
    private BigDecimal production;
    private BigDecimal waste;
}

