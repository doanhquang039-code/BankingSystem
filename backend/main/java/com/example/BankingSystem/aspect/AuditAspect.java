package com.example.BankingSystem.aspect;

import com.example.BankingSystem.annotation.Audit;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);
    private final AuditLogService auditLogService;

    public AuditAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Chạy sau khi method được gắn annotation @Audit thực thi thành công.
     */
    @AfterReturning(pointcut = "@annotation(auditAnnotation)", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Audit auditAnnotation, Object result) {
        try {
            String action = auditAnnotation.action();
            String performedBy = getLoggedInUsername();
            String ipAddress = getClientIp();

            Long entityId = null;
            String entityType = null;
            String description = "";

            if (result instanceof TransactionResponse response) {
                entityId = response.id();
                entityType = "transactions";

                switch (action) {
                    case "DEPOSIT" -> description = String.format(
                            "Deposit %,.0f VND vào tài khoản %s. Mô tả: %s",
                            response.amount(), response.destinationAccountNumber(), response.description());
                    case "WITHDRAW" -> description = String.format(
                            "Withdraw %,.0f VND từ tài khoản %s. Mô tả: %s",
                            response.amount(), response.sourceAccountNumber(), response.description());
                    case "TRANSFER" -> description = String.format(
                            "Transfer %,.0f VND từ %s đến %s. Mô tả: %s",
                            response.amount(), response.sourceAccountNumber(), response.destinationAccountNumber(), response.description());
                    default -> description = String.format(
                            "Giao dịch %s số tiền %,.0f VND",
                            action, response.amount());
                }
            } else {
                // Hỗ trợ các kiểu trả về khác nếu có
                description = "Thực hiện hành động: " + action;
            }

            // Gọi log async
            auditLogService.log(action, entityType, entityId, performedBy, ipAddress, description);
            log.info("AOP Audit: Action [{}] performed by [{}] from IP [{}] logged successfully.", action, performedBy, ipAddress);

        } catch (Exception e) {
            log.error("Lỗi khi tạo AOP Audit Log: {}", e.getMessage(), e);
        }
    }

    private String getLoggedInUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "system";
    }

    private String getClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
            return ip;
        }
        return null;
    }
}
