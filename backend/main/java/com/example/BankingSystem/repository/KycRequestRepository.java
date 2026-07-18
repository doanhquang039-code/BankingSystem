package com.example.BankingSystem.repository;

import com.example.BankingSystem.enums.KycStatus;
import com.example.BankingSystem.model.KycRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycRequestRepository extends JpaRepository<KycRequest, Long> {

    /** Tìm hồ sơ KYC mới nhất của customer */
    Optional<KycRequest> findTopByCustomerIdOrderByCreatedAtDesc(Long customerId);

    /** Danh sách KYC theo status (Staff duyệt) */
    Page<KycRequest> findByStatusOrderByCreatedAtAsc(KycStatus status, Pageable pageable);

    /** Tất cả KYC theo status */
    List<KycRequest> findByStatus(KycStatus status);

    /** Kiểm tra customer đã có KYC pending/approved chưa */
    boolean existsByCustomerIdAndStatusIn(Long customerId, List<KycStatus> statuses);
}
