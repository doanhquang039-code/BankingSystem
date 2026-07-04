package com.example.BankingSystem.service;

import com.example.BankingSystem.model.AuditLog;
import com.example.BankingSystem.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service ghi lịch sử thao tác vào bảng audit_log.
 * Các method được ghi async để không ảnh hưởng performance của business logic chính.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void log(String action, String entityType, Long entityId,
                    String performedBy, String ipAddress, String description) {
        try {
            auditLogRepository.save(
                    new AuditLog(action, entityType, entityId, performedBy, ipAddress, description));
        } catch (Exception e) {
            // Lỗi audit log không được ảnh hưởng business transaction
        }
    }

    @Async
    public void log(String action, String performedBy, String description) {
        log(action, null, null, performedBy, null, description);
    }

    public org.springframework.data.domain.Page<AuditLog> getLogs(int page, int size) {
        return auditLogRepository.findAll(
                org.springframework.data.domain.PageRequest.of(
                        page, 
                        size, 
                        org.springframework.data.domain.Sort.by("createdAt").descending()
                )
        );
    }
}
