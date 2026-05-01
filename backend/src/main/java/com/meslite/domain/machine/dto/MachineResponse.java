package com.meslite.domain.machine.dto;

import com.meslite.domain.machine.MachineStatus;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineResponse {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String name;
    private String serialNumber;
    private MachineStatus status;
    private OffsetDateTime statusSince;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

