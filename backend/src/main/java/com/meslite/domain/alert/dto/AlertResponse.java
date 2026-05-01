package com.meslite.domain.alert.dto;

import com.meslite.domain.alert.AlertSeverity;
import com.meslite.domain.alert.AlertType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlertResponse {
    private Long id;
    private AlertType alertType;
    private AlertSeverity severity;
    private Long machineId;
    private String machineName;
    private Long departmentId;
    private String departmentName;
    private Long materialId;
    private String materialTrackingCode;
    private String message;
    private BigDecimal thresholdValue;
    private BigDecimal actualValue;
    private Boolean isRead;
    private OffsetDateTime createdAt;
}

