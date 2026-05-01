package com.meslite.domain.user.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignMachinesRequest {

    @NotNull(message = "Makine listesi zorunludur.")
    private Set<Long> machineIds;
}

