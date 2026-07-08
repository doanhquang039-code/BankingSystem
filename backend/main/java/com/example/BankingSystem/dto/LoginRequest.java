package com.example.BankingSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Username không được để trống")
        String username,

        @NotBlank(message = "Password không được để trống")
        @Size(min = 6, message = "Password tối thiểu 6 ký tự")
        String password,

        @NotBlank(message = "Mã CAPTCHA ID không được để trống")
        String captchaId,

        @NotBlank(message = "Mã xác thực CAPTCHA không được để trống")
        String captchaCode
) {}
