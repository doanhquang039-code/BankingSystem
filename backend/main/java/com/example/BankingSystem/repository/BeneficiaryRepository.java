package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.Beneficiary;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByOwnerUserIdAndIsActiveTrueOrderByAliasAsc(Long userId);
    Optional<Beneficiary> findByIdAndOwnerUserId(Long id, Long userId);
    boolean existsByOwnerUserIdAndAccountNumber(Long userId, String accountNumber);
}
