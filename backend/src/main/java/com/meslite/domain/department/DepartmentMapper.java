package com.meslite.domain.department;

import com.meslite.domain.department.dto.DepartmentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DepartmentMapper {
    DepartmentResponse toResponse(Department department);
}

