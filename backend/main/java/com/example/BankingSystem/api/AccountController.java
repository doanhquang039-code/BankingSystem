package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.AccountResponse;
import com.example.BankingSystem.dto.CreateAccountRequest;
import com.example.BankingSystem.service.AccountService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public List<AccountResponse> getAccounts(@RequestParam(required = false) Long customerId) {
        if (customerId != null) {
            return accountService.getAccountsByCustomer(customerId);
        }
        return accountService.getAccounts();
    }

    @GetMapping("/{accountNumber}")
    public AccountResponse getAccount(@PathVariable String accountNumber) {
        return accountService.getAccount(accountNumber);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return accountService.createAccount(request);
    }

    /** PUT /api/accounts/{accountNumber}/freeze — Đóng băng tài khoản (ADMIN only) */
    @PutMapping("/{accountNumber}/freeze")
    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse freeze(@PathVariable String accountNumber) {
        return accountService.freezeAccount(accountNumber);
    }

    /** PUT /api/accounts/{accountNumber}/activate — Kích hoạt lại tài khoản (ADMIN only) */
    @PutMapping("/{accountNumber}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse activate(@PathVariable String accountNumber) {
        return accountService.activateAccount(accountNumber);
    }
}
