package com.example.BankingSystem.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        String title,
        String body,
        Boolean isRead,
        String refType,
        Long refId,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {}
