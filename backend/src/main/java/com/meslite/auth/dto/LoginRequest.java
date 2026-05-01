package com.meslite.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @Email(message = "Geçerli bir e-posta giriniz.")
    @NotBlank(message = "E-posta zorunludur.")
    private String email;

    @NotBlank(message = "Şifre zorunludur.")
    private String password;
}

