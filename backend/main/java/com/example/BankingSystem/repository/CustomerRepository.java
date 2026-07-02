package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.Customer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<Customer> findByEmail(String email);
}

