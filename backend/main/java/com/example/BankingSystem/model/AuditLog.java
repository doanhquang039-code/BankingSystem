package com.example.BankingSystem.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng audit_log (V4 migration).
 * Ghi lại lịch sử toàn bộ thao tác quan trọng trong hệ thống.
 */
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ví dụ: LOGIN, TRANSFER, DEPOSIT, WITHDRAW, REGISTER */
    @Column(nullable = false, length = 50)
    private String action;

    /** Tên bảng/entity liên quan: accounts, customers... */
    @Column(length = 50)
    private String entityType;

    /** ID của entity bị tác động */
    @Column
    private Long entityId;

    /** Username thực hiện thao tác */
    @Column(nullable = false, length = 50)
    private String performedBy;

    /** Địa chỉ IP người dùng */
    @Column(length = 45)
    private String ipAddress;

    /** Mô tả chi tiết thao tác */
    @Column(length = 500)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Constructor tiện lợi ───────────────────────────────────────────────

    public AuditLog() {}

    public AuditLog(String action, String entityType, Long entityId,
                    String performedBy, String ipAddress, String description) {
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.performedBy = performedBy;
        this.ipAddress = ipAddress;
        this.description = description;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
