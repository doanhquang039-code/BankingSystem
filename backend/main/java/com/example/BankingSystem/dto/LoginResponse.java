package com.example.BankingSystem.dto;

import com.example.BankingSystem.enums.UserRole;

public record LoginResponse(
        String token,
        String tokenType,
        String username,
        String email,
        UserRole role,
        Long expiresInMs,
        Long customerId,
        String customerName
) {
    public static LoginResponse of(String token, String username, String email, UserRole role, Long expiresInMs, Long customerId, String customerName) {
        return new LoginResponse(token, "Bearer", username, email, role, expiresInMs, customerId, customerName);
    }
}
