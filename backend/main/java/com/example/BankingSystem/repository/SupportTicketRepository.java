package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.SupportTicket;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<SupportTicket> findByStatus(String status);
}
