package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.MoneyOperationRequest;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.dto.TransferRequest;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.model.BankTransaction;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.enums.TransactionType;
import com.example.BankingSystem.repository.AccountRepository;
import com.example.BankingSystem.repository.TransactionRepository;
import com.example.BankingSystem.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public TransactionService(AccountService accountService,
                              AccountRepository accountRepository,
                              TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              AuditLogService auditLogService) {
        this.accountService = accountService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAccount(String accountNumber) {
        Account account = accountService.findActiveAccount(accountNumber);
        return transactionRepository
                .findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(
                        account.getId(), account.getId())
                .stream().map(this::toResponse).toList();
    }

    /** Lịch sử giao dịch có phân trang */
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionsByAccountPaged(
            String accountNumber, int page, int size) {
        Account account = accountService.findActiveAccount(accountNumber);
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository
                .findBySourceAccountIdOrDestinationAccountIdOrderByCreatedAtDesc(
                        account.getId(), account.getId(), pageable)
                .map(this::toResponse);
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
        BankTransaction saved = transactionRepository.save(transaction);

        // Gửi notification async cho chủ tài khoản
        notifyAccountOwner(account, "CREDIT",
                "Tiền vào tài khoản",
                String.format("Tài khoản %s nhận +%,.0f VND. Số dư: %,.0f VND.",
                        accountNumber, request.amount(), account.getBalance()),
                saved.getId());

        auditLogService.log("DEPOSIT", "accounts", account.getId(),
                "system", null,
                String.format("Deposit %,.0f VND vào %s", request.amount(), accountNumber));

        return toResponse(saved);
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
        BankTransaction saved = transactionRepository.save(transaction);

        notifyAccountOwner(account, "DEBIT",
                "Rút tiền thành công",
                String.format("Tài khoản %s đã rút %,.0f VND. Số dư còn: %,.0f VND.",
                        accountNumber, request.amount(), account.getBalance()),
                saved.getId());

        auditLogService.log("WITHDRAW", "accounts", account.getId(),
                "system", null,
                String.format("Withdraw %,.0f VND từ %s", request.amount(), accountNumber));

        return toResponse(saved);
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
        BankTransaction saved = transactionRepository.save(transaction);

        // Notification cho người gửi
        notifyAccountOwner(source, "DEBIT",
                "Chuyển khoản thành công",
                String.format("Đã chuyển %,.0f VND đến %s. Số dư còn: %,.0f VND.",
                        request.amount(), request.toAccountNumber(), source.getBalance()),
                saved.getId());

        // Notification cho người nhận
        notifyAccountOwner(destination, "CREDIT",
                "Nhận tiền chuyển khoản",
                String.format("Tài khoản %s nhận +%,.0f VND từ %s.",
                        request.toAccountNumber(), request.amount(), request.fromAccountNumber()),
                saved.getId());

        auditLogService.log("TRANSFER", "accounts", source.getId(),
                "system", null,
                String.format("Transfer %,.0f VND từ %s đến %s",
                        request.amount(), request.fromAccountNumber(), request.toAccountNumber()));

        return toResponse(saved);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ensureEnoughBalance(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("transaction.insufficient_balance");
        }
    }

    private void notifyAccountOwner(Account account, String type, String title, String body, Long txId) {
        try {
            User owner = userRepository.findAll().stream()
                    .filter(u -> u.getCustomer() != null &&
                            u.getCustomer().getId().equals(account.getCustomer().getId()))
                    .findFirst().orElse(null);
            if (owner != null) {
                notificationService.sendAsync(owner.getId(), type, title, body, "transactions", txId);
            }
        } catch (Exception ignored) {}
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
                transaction.getCreatedAt());
    }
}
