package com.example.BankingSystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record CreateAccountRequest(
        @NotNull Long customerId,
        @PositiveOrZero BigDecimal initialBalance
) {
}

