package com.example.BankingSystem.api;

import com.example.BankingSystem.model.Loan;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import com.example.BankingSystem.service.LoanService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;
    private final UserRepository userRepository;

    public LoanController(LoanService loanService, UserRepository userRepository) {
        this.loanService = loanService;
        this.userRepository = userRepository;
    }

    public record RequestLoanRequest(
            BigDecimal amount,
            Integer termMonths
    ) {}

    @GetMapping("/me")
    public List<Loan> getMyLoans(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return loanService.getLoansForCustomer(user.getCustomer().getId());
    }

    @PostMapping
    public Loan requestLoan(@AuthenticationPrincipal UserDetails userDetails, @RequestBody RequestLoanRequest request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return loanService.requestLoan(
                user.getCustomer().getId(),
                request.amount(),
                request.termMonths()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<Loan> getAllLoans() {
        return loanService.getAllLoans();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public Loan approveLoan(@PathVariable Long id) {
        return loanService.approveLoan(id);
    }
}
