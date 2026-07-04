package com.example.BankingSystem.repository;

import com.example.BankingSystem.model.Voucher;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByCustomerNull(); // Vouchers in shop
    List<Voucher> findByCustomerId(Long customerId); // Customer's redeemed vouchers
}
