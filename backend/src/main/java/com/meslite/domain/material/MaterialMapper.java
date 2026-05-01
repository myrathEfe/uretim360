package com.meslite.domain.material;

import com.meslite.domain.material.dto.MaterialHistoryResponse;
import com.meslite.domain.material.dto.MaterialResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MaterialMapper {

    @Mapping(target = "currentMachineId", source = "currentMachine.id")
    @Mapping(target = "currentMachineName", source = "currentMachine.name")
    @Mapping(target = "currentDepartmentId", source = "currentDepartment.id")
    @Mapping(target = "currentDepartmentName", source = "currentDepartment.name")
    MaterialResponse toResponse(Material material);

    @Mapping(target = "machineId", source = "machine.id")
    @Mapping(target = "machineName", source = "machine.name")
    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "productionRecordId", source = "productionRecord.id")
    MaterialHistoryResponse toHistoryResponse(MaterialStageHistory history);
}

