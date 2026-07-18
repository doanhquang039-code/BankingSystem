package com.example.BankingSystem.dto;

import com.example.BankingSystem.enums.KycStatus;

import java.time.LocalDateTime;

/**
 * Response DTO cho KYC request – trả về cho cả Customer và Staff.
 */
public record KycResponse(
        Long id,
        Long customerId,
        String customerName,
        String fullName,
        String idNumber,
        String idType,
        String frontImageUrl,
        String backImageUrl,
        String selfieUrl,
        KycStatus status,
        String rejectionReason,
        String reviewedBy,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {}
