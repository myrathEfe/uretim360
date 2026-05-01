package com.meslite.domain.machine.dto;

import com.meslite.domain.machine.MachineStatus;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineStatusLogResponse {
    private Long id;
    private MachineStatus oldStatus;
    private MachineStatus newStatus;
    private Long changedByUserId;
    private String changedByName;
    private String note;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;
}

