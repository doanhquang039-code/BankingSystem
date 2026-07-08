package com.example.BankingSystem.api;

import com.example.BankingSystem.model.SavingsAccount;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import com.example.BankingSystem.service.SavingsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {
    private final SavingsService savingsService;
    private final UserRepository userRepository;

    public SavingsController(SavingsService savingsService, UserRepository userRepository) {
        this.savingsService = savingsService;
        this.userRepository = userRepository;
    }

    public record OpenSavingsRequest(
            String sourceAccountNumber,
            BigDecimal amount,
            Integer termMonths
    ) {}

    @GetMapping("/me")
    public List<SavingsAccount> getMySavings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return savingsService.getSavingsForCustomer(user.getCustomer().getId());
    }

    @PostMapping
    public SavingsAccount openSavings(@AuthenticationPrincipal UserDetails userDetails, @RequestBody OpenSavingsRequest request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return savingsService.openSavingsAccount(
                user.getCustomer().getId(),
                request.sourceAccountNumber(),
                request.amount(),
                request.termMonths()
        );
    }
}
