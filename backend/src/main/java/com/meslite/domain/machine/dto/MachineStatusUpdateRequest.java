package com.meslite.domain.machine.dto;

import com.meslite.domain.machine.MachineStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineStatusUpdateRequest {

    @NotNull(message = "Yeni durum zorunludur.")
    private MachineStatus newStatus;

    private String note;
}

