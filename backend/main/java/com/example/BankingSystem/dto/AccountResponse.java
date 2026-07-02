package com.example.BankingSystem.dto;

import com.example.BankingSystem.enums.AccountStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        BigDecimal balance,
        AccountStatus status,
        Long customerId,
        String customerName,
        LocalDateTime createdAt
) {
}

