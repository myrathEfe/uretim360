package com.meslite.domain.user;

import com.meslite.domain.user.dto.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "assignedMachineIds", expression = "java(user.getAssignedMachines().stream().map(com.meslite.domain.machine.Machine::getId).sorted().toList())")
    UserResponse toResponse(User user);
}

