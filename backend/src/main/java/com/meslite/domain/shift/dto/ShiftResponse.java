package com.meslite.domain.shift.dto;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShiftResponse {
    private Long id;
    private String name;
    private Long supervisorId;
    private String supervisorName;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Boolean isActive;
    private OffsetDateTime createdAt;
}

