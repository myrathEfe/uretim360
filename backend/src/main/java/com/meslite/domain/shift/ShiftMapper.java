package com.meslite.domain.shift;

import com.meslite.domain.shift.dto.ShiftResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShiftMapper {

    @Mapping(target = "supervisorId", source = "supervisor.id")
    @Mapping(target = "supervisorName", source = "supervisor.fullName")
    ShiftResponse toResponse(Shift shift);
}

