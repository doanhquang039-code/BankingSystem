package com.example.BankingSystem.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_lessons")
@IdClass(CustomerLessonId.class)
public class CustomerLesson {

    @Id
    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Id
    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();

    public CustomerLesson() {}

    public CustomerLesson(Long customerId, Long lessonId) {
        this.customerId = customerId;
        this.lessonId = lessonId;
        this.completedAt = LocalDateTime.now();
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
