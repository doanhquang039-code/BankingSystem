package com.example.BankingSystem.model;

import com.example.BankingSystem.enums.KycStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity lưu hồ sơ KYC (Know Your Customer) của từng Customer.
 *
 * <p>Mỗi Customer chỉ có tối đa 1 KYC hồ sơ hoạt động (latest).
 * Khi resubmit, record cũ bị SUPERSEDED và record mới được tạo với
 * status RESUBMITTED → PENDING (sau khi staff review lại).
 */
@Entity
@Table(name = "kyc_requests", indexes = {
        @Index(name = "idx_kyc_customer", columnList = "customer_id"),
        @Index(name = "idx_kyc_status", columnList = "status")
})
public class KycRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Customer nộp hồ sơ */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 120)
    private String fullName;

    /** Số CCCD / Passport */
    @Column(nullable = false, unique = true, length = 30)
    private String idNumber;

    /** "CCCD" hoặc "PASSPORT" */
    @Column(nullable = false, length = 20)
    private String idType;

    /** URL ảnh mặt trước CCCD (lưu trên Cloudinary) */
    @Column(length = 500)
    private String frontImageUrl;

    /** URL ảnh mặt sau CCCD */
    @Column(length = 500)
    private String backImageUrl;

    /** URL ảnh selfie cầm CCCD */
    @Column(length = 500)
    private String selfieUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KycStatus status = KycStatus.PENDING;

    /** Lý do từ chối (chỉ có khi status = REJECTED) */
    @Column(length = 500)
    private String rejectionReason;

    /** Username của nhân viên duyệt */
    @Column(length = 50)
    private String reviewedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime reviewedAt;

    // ── Getters & Setters ──────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }

    public String getIdType() { return idType; }
    public void setIdType(String idType) { this.idType = idType; }

    public String getFrontImageUrl() { return frontImageUrl; }
    public void setFrontImageUrl(String frontImageUrl) { this.frontImageUrl = frontImageUrl; }

    public String getBackImageUrl() { return backImageUrl; }
    public void setBackImageUrl(String backImageUrl) { this.backImageUrl = backImageUrl; }

    public String getSelfieUrl() { return selfieUrl; }
    public void setSelfieUrl(String selfieUrl) { this.selfieUrl = selfieUrl; }

    public KycStatus getStatus() { return status; }
    public void setStatus(KycStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
