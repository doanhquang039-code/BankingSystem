package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByCustomerId(Long customerId);
    Optional<Card> findByCardNumber(String cardNumber);
}
