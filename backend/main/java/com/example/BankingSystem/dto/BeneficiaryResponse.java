package com.example.BankingSystem.dto;

import java.time.LocalDateTime;

public record BeneficiaryResponse(
        Long id,
        String alias,
        String accountNumber,
        String bankName,
        String beneficiaryName,
        LocalDateTime createdAt
) {}
