package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.BankTransaction;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(
            Long sourceAccountId, Long destinationAccountId);

    Page<BankTransaction> findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(
            Long sourceAccountId, Long destinationAccountId, Pageable pageable);
}


