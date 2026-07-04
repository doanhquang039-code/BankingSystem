package com.example.BankingSystem.model;

import java.io.Serializable;
import java.util.Objects;

public class CustomerLessonId implements Serializable {
    private Long customerId;
    private Long lessonId;

    public CustomerLessonId() {}

    public CustomerLessonId(Long customerId, Long lessonId) {
        this.customerId = customerId;
        this.lessonId = lessonId;
    }

    // Getters, setters, equals, and hashCode
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomerLessonId that = (CustomerLessonId) o;
        return Objects.equals(customerId, that.customerId) && Objects.equals(lessonId, that.lessonId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId, lessonId);
    }
}
