package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.MoneyOperationRequest;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.dto.TransferRequest;
import com.example.BankingSystem.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /** GET /api/transactions/accounts/{accountNumber} — Tất cả giao dịch (không phân trang) */
    @GetMapping("/accounts/{accountNumber}")
    public List<TransactionResponse> getTransactionsByAccount(@PathVariable String accountNumber) {
        return transactionService.getTransactionsByAccount(accountNumber);
    }

    /** GET /api/transactions/accounts/{accountNumber}/statement?page=0&size=20 — Sao kê có phân trang */
    @GetMapping("/accounts/{accountNumber}/statement")
    public Page<TransactionResponse> getStatement(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return transactionService.getTransactionsByAccountPaged(accountNumber, page, size);
    }

    @PostMapping("/accounts/{accountNumber}/deposit")
    public TransactionResponse deposit(@PathVariable String accountNumber,
                                       @Valid @RequestBody MoneyOperationRequest request) {
        return transactionService.deposit(accountNumber, request);
    }

    @PostMapping("/accounts/{accountNumber}/withdraw")
    public TransactionResponse withdraw(@PathVariable String accountNumber,
                                        @Valid @RequestBody MoneyOperationRequest request) {
        return transactionService.withdraw(accountNumber, request);
    }

    @PostMapping("/transfer")
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request) {
        return transactionService.transfer(request);
    }
}

