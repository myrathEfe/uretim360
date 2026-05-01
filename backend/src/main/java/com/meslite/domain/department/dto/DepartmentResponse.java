package com.meslite.domain.department.dto;

import com.meslite.domain.department.SectorType;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentResponse {
    private Long id;
    private String name;
    private SectorType sectorType;
    private Integer displayOrder;
    private Boolean isActive;
    private OffsetDateTime createdAt;
}

