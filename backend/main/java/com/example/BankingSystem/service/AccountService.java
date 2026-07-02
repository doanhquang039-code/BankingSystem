package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.AccountResponse;
import com.example.BankingSystem.dto.CreateAccountRequest;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.enums.AccountStatus;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.repository.AccountRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AccountRepository accountRepository;
    private final CustomerService customerService;

    public AccountService(AccountRepository accountRepository, CustomerService customerService) {
        this.accountRepository = accountRepository;
        this.customerService = customerService;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByCustomer(Long customerId) {
        return accountRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccount(String accountNumber) {
        return toResponse(findActiveAccount(accountNumber));
    }

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        Customer customer = customerService.findCustomer(request.customerId());
        Account account = new Account();
        account.setCustomer(customer);
        account.setAccountNumber(generateAccountNumber());
        account.setBalance(request.initialBalance() == null ? BigDecimal.ZERO : request.initialBalance());
        return toResponse(accountRepository.save(account));
    }

    public Account findActiveAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("account.inactive", accountNumber);
        }
        return account;
    }

    private String generateAccountNumber() {
        String accountNumber;
        do {
            accountNumber = "10" + String.format("%010d", Math.abs(RANDOM.nextLong()) % 10_000_000_000L);
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    public AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getStatus(),
                account.getCustomer().getId(),
                account.getCustomer().getFullName(),
                account.getCreatedAt()
        );
    }
}


