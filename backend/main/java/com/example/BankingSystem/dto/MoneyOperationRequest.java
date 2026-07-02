package com.example.BankingSystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MoneyOperationRequest(
        @NotNull @Positive BigDecimal amount,
        @Size(max = 255) String description
) {
}

