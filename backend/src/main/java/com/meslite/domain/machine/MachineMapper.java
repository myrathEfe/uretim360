package com.meslite.domain.machine;

import com.meslite.domain.machine.dto.MachineResponse;
import com.meslite.domain.machine.dto.MachineStatusLogResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MachineMapper {

    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    MachineResponse toResponse(Machine machine);

    @Mapping(target = "changedByUserId", source = "changedBy.id")
    @Mapping(target = "changedByName", source = "changedBy.fullName")
    MachineStatusLogResponse toLogResponse(MachineStatusLog log);
}

