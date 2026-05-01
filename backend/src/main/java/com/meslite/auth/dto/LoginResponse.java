package com.meslite.auth.dto;

import com.meslite.domain.user.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private Long userId;
    private Role role;
    private String name;
    private String email;
}

