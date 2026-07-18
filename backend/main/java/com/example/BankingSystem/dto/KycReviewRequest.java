package com.example.BankingSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request body khi Staff duyệt (approve/reject) hồ sơ KYC.
 */
public record KycReviewRequest(

        @NotBlank(message = "Action is required")
        @Pattern(regexp = "APPROVE|REJECT", message = "action must be APPROVE or REJECT")
        String action,

        /** Bắt buộc khi action = REJECT */
        String rejectionReason
) {}
