package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.CustomerLesson;
import com.example.BankingSystem.model.CustomerLessonId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerLessonRepository extends JpaRepository<CustomerLesson, CustomerLessonId> {
    List<CustomerLesson> findByCustomerId(Long customerId);
    boolean existsByCustomerIdAndLessonId(Long customerId, Long lessonId);
}
