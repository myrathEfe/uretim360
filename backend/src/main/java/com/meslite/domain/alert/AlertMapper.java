package com.meslite.domain.alert;

import com.meslite.domain.alert.dto.AlertResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AlertMapper {

    @Mapping(target = "machineId", source = "machine.id")
    @Mapping(target = "machineName", source = "machine.name")
    @Mapping(target = "departmentId", source = "machine.department.id")
    @Mapping(target = "departmentName", source = "machine.department.name")
    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialTrackingCode", source = "material.trackingCode")
    AlertResponse toResponse(Alert alert);
}
