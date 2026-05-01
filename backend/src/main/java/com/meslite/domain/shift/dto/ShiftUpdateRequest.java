package com.meslite.domain.shift.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShiftUpdateRequest {

    @NotBlank(message = "Vardiya adı zorunludur.")
    private String name;

    private Long supervisorId;

    @NotNull(message = "Başlangıç zamanı zorunludur.")
    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    @NotNull(message = "Aktif bilgisi zorunludur.")
    private Boolean isActive;
}

