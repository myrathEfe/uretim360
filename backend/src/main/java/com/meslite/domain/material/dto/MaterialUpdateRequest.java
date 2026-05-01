package com.meslite.domain.material.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialUpdateRequest {

    @NotBlank(message = "Malzeme adı zorunludur.")
    private String name;

    @NotNull(message = "Bölüm seçimi zorunludur.")
    private Long currentDepartmentId;

    private Long currentMachineId;

    @NotNull(message = "Tamamlanma bilgisi zorunludur.")
    private Boolean isCompleted;
}

