package com.meslite.domain.production.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductionRecordCreateRequest {

    @NotNull(message = "Malzeme seçimi zorunludur.")
    private Long materialId;

    @NotNull(message = "Makine seçimi zorunludur.")
    private Long machineId;

    private Long shiftId;

    @NotNull(message = "Girdi miktarı zorunludur.")
    @DecimalMin(value = "0.000", inclusive = false, message = "Girdi miktarı sıfırdan büyük olmalıdır.")
    private BigDecimal inputQty;

    @NotNull(message = "Çıktı miktarı zorunludur.")
    @DecimalMin(value = "0.000", inclusive = true, message = "Çıktı miktarı sıfır veya daha büyük olmalıdır.")
    private BigDecimal outputQty;

    private String notes;
}

