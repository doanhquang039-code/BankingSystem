package com.example.BankingSystem.dto;

public record CaptchaResponse(
        String captchaId,
        String captchaImage
) {
}
