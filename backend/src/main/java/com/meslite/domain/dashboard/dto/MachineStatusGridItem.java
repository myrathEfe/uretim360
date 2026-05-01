package com.meslite.domain.dashboard.dto;

import com.meslite.domain.machine.MachineStatus;
import java.time.OffsetDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MachineStatusGridItem {
    private Long machineId;
    private String machineName;
    private String departmentName;
    private MachineStatus status;
    private OffsetDateTime statusSince;
    private String materialTrackingCode;
}

