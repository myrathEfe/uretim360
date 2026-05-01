package com.meslite.domain.material.dto;

import com.meslite.domain.material.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialCreateRequest {

    @NotBlank(message = "Malzeme adı zorunludur.")
    private String name;

    @NotNull(message = "Malzeme tipi zorunludur.")
    private MaterialType materialType;

    @NotNull(message = "Bölüm seçimi zorunludur.")
    private Long currentDepartmentId;

    private Long currentMachineId;
}

