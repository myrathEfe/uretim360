package com.meslite.domain.department.dto;

import com.meslite.domain.department.SectorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentRequest {

    @NotBlank(message = "Bölüm adı zorunludur.")
    private String name;

    @NotNull(message = "Sektör tipi zorunludur.")
    private SectorType sectorType;

    @NotNull(message = "Sıralama zorunludur.")
    private Integer displayOrder;

    @NotNull(message = "Durum bilgisi zorunludur.")
    private Boolean isActive;
}

