package com.meslite.domain.dashboard.dto;

import com.meslite.domain.machine.MachineStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MachineStatusDistributionItem {
    private MachineStatus status;
    private Long count;
}

