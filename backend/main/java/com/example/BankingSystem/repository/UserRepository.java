package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByCustomerId(Long customerId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
