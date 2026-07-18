package com.example.BankingSystem.enums;

/**
 * KYC (Know Your Customer) review status lifecycle:
 *
 * <pre>
 *  Customer submits → PENDING
 *  Staff approves  → APPROVED
 *  Staff rejects   → REJECTED
 *  Customer fixes and resubmits → RESUBMITTED → (back to PENDING review)
 * </pre>
 */
public enum KycStatus {
    PENDING,
    APPROVED,
    REJECTED,
    RESUBMITTED
}
