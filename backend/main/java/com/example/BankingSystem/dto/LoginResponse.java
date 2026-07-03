package com.example.BankingSystem.dto;

import com.example.BankingSystem.enums.UserRole;

public record LoginResponse(
        String token,
        String tokenType,
        String username,
        String email,
        UserRole role,
        Long expiresInMs
) {
    public static LoginResponse of(String token, String username, String email, UserRole role, Long expiresInMs) {
        return new LoginResponse(token, "Bearer", username, email, role, expiresInMs);
    }
}
