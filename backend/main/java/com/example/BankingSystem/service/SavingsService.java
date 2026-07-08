package com.example.BankingSystem.service;

import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.model.SavingsAccount;
import com.example.BankingSystem.repository.AccountRepository;
import com.example.BankingSystem.repository.SavingsAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class SavingsService {
    private final SavingsAccountRepository savingsRepository;
    private final AccountRepository accountRepository;
    private final Random random = new Random();

    public SavingsService(SavingsAccountRepository savingsRepository, AccountRepository accountRepository) {
        this.savingsRepository = savingsRepository;
        this.accountRepository = accountRepository;
    }

    public List<SavingsAccount> getSavingsForCustomer(Long customerId) {
        return savingsRepository.findByCustomerId(customerId);
    }

    @Transactional
    public SavingsAccount openSavingsAccount(Long customerId, String sourceAccountNumber, BigDecimal amount, Integer termMonths) {
        if (amount.compareTo(BigDecimal.valueOf(1000000)) < 0) {
            throw new BadRequestException("Số tiền gửi tiết kiệm tối thiểu là 1,000,000 VND");
        }

        // Tìm tài khoản nguồn trích tiền
        Account sourceAcc = accountRepository.findByAccountNumber(sourceAccountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản nguồn không tồn tại"));

        if (!sourceAcc.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("Bạn không sở hữu tài khoản thanh toán này");
        }

        if (sourceAcc.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Số dư tài khoản thanh toán không đủ");
        }

        // Trích tiền từ tài khoản thanh toán
        sourceAcc.setBalance(sourceAcc.getBalance().subtract(amount));
        accountRepository.save(sourceAcc);

        // Xác định lãi suất dựa trên kỳ hạn
        BigDecimal rate;
        switch (termMonths) {
            case 1: rate = BigDecimal.valueOf(3.50); break;
            case 3: rate = BigDecimal.valueOf(4.50); break;
            case 6: rate = BigDecimal.valueOf(5.50); break;
            case 12: rate = BigDecimal.valueOf(7.20); break;
            default: throw new BadRequestException("Kỳ hạn gửi tiết kiệm không hợp lệ (1, 3, 6, 12 tháng)");
        }

        // Sinh số tài khoản tiết kiệm ngẫu nhiên
        String savingsAccountNumber = "80" + String.format("%010d", random.nextLong(10000000000L));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maturityDate = now.plusMonths(termMonths);

        SavingsAccount savings = new SavingsAccount(
                customerId,
                savingsAccountNumber,
                amount,
                rate,
                termMonths,
                now,
                maturityDate,
                "ACTIVE"
        );

        return savingsRepository.save(savings);
    }
}
