package com.meslite.domain.machine.dto;

import com.meslite.domain.machine.MachineStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineRequest {

    @NotNull(message = "Bölüm seçimi zorunludur.")
    private Long departmentId;

    @NotBlank(message = "Makine adı zorunludur.")
    private String name;

    private String serialNumber;

    @NotNull(message = "Makine durumu zorunludur.")
    private MachineStatus status;

    @NotNull(message = "Durum bilgisi zorunludur.")
    private Boolean isActive;
}

