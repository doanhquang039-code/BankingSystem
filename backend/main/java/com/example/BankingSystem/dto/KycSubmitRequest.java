package com.example.BankingSystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request body khi Customer nộp hoặc resubmit hồ sơ KYC.
 */
public record KycSubmitRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 120)
        String fullName,

        @NotBlank(message = "ID number is required")
        @Size(max = 30)
        String idNumber,

        @NotBlank(message = "ID type is required")
        @Pattern(regexp = "CCCD|PASSPORT", message = "idType must be CCCD or PASSPORT")
        String idType,

        /** URL ảnh mặt trước (đã upload lên Cloudinary trước khi submit) */
        String frontImageUrl,

        /** URL ảnh mặt sau */
        String backImageUrl,

        /** URL ảnh selfie */
        String selfieUrl
) {}
