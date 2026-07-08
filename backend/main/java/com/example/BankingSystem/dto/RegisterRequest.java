package com.example.BankingSystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 50, message = "Username từ 3-50 ký tự")
        String username,

        @NotBlank(message = "Password không được để trống")
        @Size(min = 6, message = "Password tối thiểu 6 ký tự")
        String password,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "Họ và tên không được để trống")
        @Size(max = 120, message = "Họ và tên tối đa 120 ký tự")
        String fullName,

        @NotBlank(message = "Số điện thoại không được để trống")
        @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự")
        String phone
) {}
