package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.NotificationResponse;
import com.example.BankingSystem.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** GET /api/notifications?page=0&size=20 — Danh sách thông báo có phân trang */
    @GetMapping
    public Page<NotificationResponse> getAll(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.getNotifications(user.getUsername(), page, size);
    }

    /** GET /api/notifications/unread-count — Số thông báo chưa đọc */
    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal UserDetails user) {
        return Map.of("count", notificationService.countUnread(user.getUsername()));
    }

    /** PUT /api/notifications/{id}/read — Đánh dấu 1 thông báo đã đọc */
    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@AuthenticationPrincipal UserDetails user,
                                           @PathVariable Long id) {
        return notificationService.markAsRead(id, user.getUsername());
    }

    /** PUT /api/notifications/read-all — Đánh dấu tất cả đã đọc */
    @PutMapping("/read-all")
    public Map<String, Integer> markAllAsRead(@AuthenticationPrincipal UserDetails user) {
        int count = notificationService.markAllAsRead(user.getUsername());
        return Map.of("updated", count);
    }
}
