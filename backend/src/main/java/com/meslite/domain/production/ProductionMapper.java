package com.meslite.domain.production;

import com.meslite.domain.production.dto.ProductionRecordResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductionMapper {

    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialTrackingCode", source = "material.trackingCode")
    @Mapping(target = "machineId", source = "machine.id")
    @Mapping(target = "machineName", source = "machine.name")
    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "shiftId", source = "shift.id")
    @Mapping(target = "shiftName", source = "shift.name")
    @Mapping(target = "recordedByUserId", source = "recordedBy.id")
    @Mapping(target = "recordedByName", source = "recordedBy.fullName")
    ProductionRecordResponse toResponse(ProductionRecord productionRecord);
}

