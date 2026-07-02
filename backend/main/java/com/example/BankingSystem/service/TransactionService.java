package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.MoneyOperationRequest;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.dto.TransferRequest;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.model.BankTransaction;
import com.example.BankingSystem.enums.TransactionType;
import com.example.BankingSystem.repository.AccountRepository;
import com.example.BankingSystem.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(AccountService accountService, AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountService = accountService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAccount(String accountNumber) {
        Account account = accountService.findActiveAccount(accountNumber);
        return transactionRepository.findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(account.getId(), account.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TransactionResponse deposit(String accountNumber, MoneyOperationRequest request) {
        Account account = accountService.findActiveAccount(accountNumber);
        account.setBalance(account.getBalance().add(request.amount()));
        accountRepository.save(account);

        BankTransaction transaction = new BankTransaction();
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setAmount(request.amount());
        transaction.setDestinationAccount(account);
        transaction.setDescription(request.description());
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse withdraw(String accountNumber, MoneyOperationRequest request) {
        Account account = accountService.findActiveAccount(accountNumber);
        ensureEnoughBalance(account, request.amount());
        account.setBalance(account.getBalance().subtract(request.amount()));
        accountRepository.save(account);

        BankTransaction transaction = new BankTransaction();
        transaction.setType(TransactionType.WITHDRAW);
        transaction.setAmount(request.amount());
        transaction.setSourceAccount(account);
        transaction.setDescription(request.description());
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        if (request.fromAccountNumber().equals(request.toAccountNumber())) {
            throw new BadRequestException("transaction.same_account");
        }

        Account source = accountService.findActiveAccount(request.fromAccountNumber());
        Account destination = accountService.findActiveAccount(request.toAccountNumber());
        ensureEnoughBalance(source, request.amount());

        source.setBalance(source.getBalance().subtract(request.amount()));
        destination.setBalance(destination.getBalance().add(request.amount()));
        accountRepository.save(source);
        accountRepository.save(destination);

        BankTransaction transaction = new BankTransaction();
        transaction.setType(TransactionType.TRANSFER);
        transaction.setAmount(request.amount());
        transaction.setSourceAccount(source);
        transaction.setDestinationAccount(destination);
        transaction.setDescription(request.description());
        return toResponse(transactionRepository.save(transaction));
    }

    private void ensureEnoughBalance(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("transaction.insufficient_balance");
        }
    }

    private TransactionResponse toResponse(BankTransaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getStatus(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getSourceAccount() == null ? null : transaction.getSourceAccount().getAccountNumber(),
                transaction.getDestinationAccount() == null ? null : transaction.getDestinationAccount().getAccountNumber(),
                transaction.getCreatedAt()
        );
    }
}


