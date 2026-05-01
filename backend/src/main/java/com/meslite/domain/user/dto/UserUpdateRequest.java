package com.meslite.domain.user.dto;

import com.meslite.domain.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @Email(message = "Geçerli bir e-posta giriniz.")
    @NotBlank(message = "E-posta zorunludur.")
    private String email;

    @NotBlank(message = "Ad soyad zorunludur.")
    private String fullName;

    private String password;

    @NotNull(message = "Rol zorunludur.")
    private Role role;

    private Long departmentId;

    @NotNull(message = "Durum bilgisi zorunludur.")
    private Boolean isActive;

    private Set<Long> machineIds;
}

