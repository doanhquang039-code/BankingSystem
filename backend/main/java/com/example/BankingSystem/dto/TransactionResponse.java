package com.example.BankingSystem.dto;

import com.example.BankingSystem.enums.TransactionStatus;
import com.example.BankingSystem.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        TransactionType type,
        TransactionStatus status,
        BigDecimal amount,
        String description,
        String sourceAccountNumber,
        String destinationAccountNumber,
        LocalDateTime createdAt
) {
}

