package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.MoneyOperationRequest;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.dto.TransferRequest;
import com.example.BankingSystem.service.TransactionService;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.repository.UserRepository;
import com.example.BankingSystem.repository.AccountRepository;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public TransactionController(TransactionService transactionService,
                                 UserRepository userRepository,
                                 AccountRepository accountRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    private void checkAccountOwnership(String username, String accountNumber) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("Access denied"));

        if (user.getRole() == com.example.BankingSystem.enums.UserRole.CUSTOMER) {
            Account account = accountRepository.findByAccountNumber(accountNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

            if (user.getCustomer() == null || !account.getCustomer().getId().equals(user.getCustomer().getId())) {
                throw new AccessDeniedException("You do not own this account");
            }
        }
    }

    /** GET /api/transactions/accounts/{accountNumber} — Tất cả giao dịch (không phân trang) */
    @GetMapping("/accounts/{accountNumber}")
    public List<TransactionResponse> getTransactionsByAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber) {
        checkAccountOwnership(userDetails.getUsername(), accountNumber);
        return transactionService.getTransactionsByAccount(accountNumber);
    }

    /** GET /api/transactions/accounts/{accountNumber}/statement?page=0&size=20 — Sao kê có phân trang */
    @GetMapping("/accounts/{accountNumber}/statement")
    public Page<TransactionResponse> getStatement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        checkAccountOwnership(userDetails.getUsername(), accountNumber);
        return transactionService.getTransactionsByAccountPaged(accountNumber, page, size);
    }

    @PostMapping("/accounts/{accountNumber}/deposit")
    public TransactionResponse deposit(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber,
            @Valid @RequestBody MoneyOperationRequest request) {
        checkAccountOwnership(userDetails.getUsername(), accountNumber);
        return transactionService.deposit(accountNumber, request);
    }

    @PostMapping("/accounts/{accountNumber}/withdraw")
    public TransactionResponse withdraw(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String accountNumber,
            @Valid @RequestBody MoneyOperationRequest request) {
        checkAccountOwnership(userDetails.getUsername(), accountNumber);
        return transactionService.withdraw(accountNumber, request);
    }

    @PostMapping("/transfer")
    public TransactionResponse transfer(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransferRequest request) {
        checkAccountOwnership(userDetails.getUsername(), request.fromAccountNumber());
        return transactionService.transfer(request);
    }
}

