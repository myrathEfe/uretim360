package com.meslite.domain.user.dto;

import com.meslite.domain.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {

    @Email(message = "Geçerli bir e-posta giriniz.")
    @NotBlank(message = "E-posta zorunludur.")
    private String email;

    @NotBlank(message = "Ad soyad zorunludur.")
    private String fullName;

    @NotBlank(message = "Şifre zorunludur.")
    @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır.")
    private String password;

    @NotNull(message = "Rol zorunludur.")
    private Role role;

    private Long departmentId;

    private Boolean isActive;

    private Set<Long> machineIds;
}

