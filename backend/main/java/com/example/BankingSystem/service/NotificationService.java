package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.NotificationResponse;
import com.example.BankingSystem.model.Notification;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.NotificationRepository;
import com.example.BankingSystem.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /** Lấy danh sách thông báo của user (có phân trang) */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String username, int page, int size) {
        User user = findUser(username);
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    /** Đếm số thông báo chưa đọc */
    @Transactional(readOnly = true)
    public long countUnread(String username) {
        User user = findUser(username);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    /** Đánh dấu 1 thông báo đã đọc */
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String username) {
        User user = findUser(username);
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new com.example.BankingSystem.exception.ResourceNotFoundException(
                        "Notification not found: " + notificationId));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return toResponse(notificationRepository.save(notification));
    }

    /** Đánh dấu tất cả đã đọc */
    @Transactional
    public int markAllAsRead(String username) {
        User user = findUser(username);
        return notificationRepository.markAllAsRead(user.getId());
    }

    /** Tạo thông báo async (gọi từ TransactionService sau giao dịch) */
    @Async
    public void sendAsync(Long userId, String type, String title, String body,
                          String refType, Long refId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setTitle(title);
            notification.setBody(body);
            notification.setRefType(refType);
            notification.setRefId(refId);
            notificationRepository.save(notification);
        } catch (Exception e) {
            // Silent — không block business transaction
        }
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getBody(),
                n.getIsRead(), n.getRefType(), n.getRefId(),
                n.getCreatedAt(), n.getReadAt());
    }
}
