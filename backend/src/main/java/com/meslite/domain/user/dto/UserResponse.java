package com.meslite.domain.user.dto;

import com.meslite.domain.user.Role;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Long departmentId;
    private String departmentName;
    private Boolean isActive;
    private List<Long> assignedMachineIds;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

