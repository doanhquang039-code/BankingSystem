package com.example.BankingSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BeneficiaryRequest(
        @NotBlank(message = "Alias không được để trống")
        @Size(max = 100)
        String alias,

        @NotBlank(message = "Số tài khoản không được để trống")
        @Size(max = 32)
        String accountNumber,

        @NotBlank(message = "Tên ngân hàng không được để trống")
        @Size(max = 100)
        String bankName,

        @NotBlank(message = "Tên người nhận không được để trống")
        @Size(max = 120)
        String beneficiaryName
) {}
