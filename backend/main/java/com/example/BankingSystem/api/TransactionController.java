package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.MoneyOperationRequest;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.dto.TransferRequest;
import com.example.BankingSystem.service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/accounts/{accountNumber}")
    public List<TransactionResponse> getTransactionsByAccount(@PathVariable String accountNumber) {
        return transactionService.getTransactionsByAccount(accountNumber);
    }

    @PostMapping("/accounts/{accountNumber}/deposit")
    public TransactionResponse deposit(@PathVariable String accountNumber, @Valid @RequestBody MoneyOperationRequest request) {
        return transactionService.deposit(accountNumber, request);
    }

    @PostMapping("/accounts/{accountNumber}/withdraw")
    public TransactionResponse withdraw(@PathVariable String accountNumber, @Valid @RequestBody MoneyOperationRequest request) {
        return transactionService.withdraw(accountNumber, request);
    }

    @PostMapping("/transfer")
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request) {
        return transactionService.transfer(request);
    }
}

