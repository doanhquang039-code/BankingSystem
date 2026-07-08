package com.example.BankingSystem.service;

import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.model.Loan;
import com.example.BankingSystem.model.BankTransaction;
import com.example.BankingSystem.repository.AccountRepository;
import com.example.BankingSystem.repository.LoanRepository;
import com.example.BankingSystem.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public LoanService(LoanRepository loanRepository, AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.loanRepository = loanRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Loan> getLoansForCustomer(Long customerId) {
        return loanRepository.findByCustomerId(customerId);
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    @Transactional
    public Loan requestLoan(Long customerId, BigDecimal amount, Integer termMonths) {
        if (amount.compareTo(BigDecimal.valueOf(5000000)) < 0) {
            throw new BadRequestException("Số tiền đăng ký vay tối thiểu là 5,000,000 VND");
        }

        // Tỷ lệ lãi suất giả định dựa trên kỳ hạn
        BigDecimal rate = BigDecimal.valueOf(8.5); // Kỳ hạn ngắn
        if (termMonths > 12) {
            rate = BigDecimal.valueOf(9.5); // Kỳ hạn dài hơn
        }

        // Tính số tiền trả góp hàng tháng = (Gốc + Lãi) / Kỳ hạn
        BigDecimal totalRepay = amount.multiply(BigDecimal.ONE.add(rate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)));
        BigDecimal monthlyPayment = totalRepay.divide(BigDecimal.valueOf(termMonths), 2, RoundingMode.HALF_UP);

        Loan loan = new Loan(
                customerId,
                amount,
                rate,
                termMonths,
                monthlyPayment,
                "PENDING",
                LocalDateTime.now()
        );

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan approveLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Khoản vay không tồn tại"));

        if (!loan.getStatus().equals("PENDING")) {
            throw new BadRequestException("Khoản vay này đã được xử lý từ trước");
        }

        // Tìm tài khoản thanh toán chính của khách hàng để giải ngân
        List<Account> customerAccounts = accountRepository.findByCustomerId(loan.getCustomerId());
        if (customerAccounts.isEmpty()) {
            throw new BadRequestException("Khách hàng chưa có tài khoản thanh toán để giải ngân");
        }
        Account destinationAcc = customerAccounts.get(0); // Giải ngân vào tài khoản đầu tiên

        // Cập nhật trạng thái vay
        loan.setStatus("APPROVED");
        loanRepository.save(loan);

        // Cộng tiền giải ngân vào tài khoản thanh toán
        destinationAcc.setBalance(destinationAcc.getBalance().add(loan.getAmount()));
        accountRepository.save(destinationAcc);

        // Tạo giao dịch giải ngân
        BankTransaction tx = new BankTransaction();
        tx.setType(com.example.BankingSystem.enums.TransactionType.DEPOSIT);
        tx.setStatus(com.example.BankingSystem.enums.TransactionStatus.COMPLETED);
        tx.setAmount(loan.getAmount());
        tx.setDescription("Giải ngân khoản vay ID #" + loan.getId());
        tx.setSourceAccount(null);
        tx.setDestinationAccount(destinationAcc);
        tx.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(tx);

        return loan;
    }
}
