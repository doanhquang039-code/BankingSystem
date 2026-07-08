package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.AccountResponse;
import com.example.BankingSystem.enums.AccountStatus;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.*;
import com.example.BankingSystem.repository.*;
import com.example.BankingSystem.service.AccountService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final SupportTicketRepository ticketRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final LoanRepository loanRepository;
    private final CardRepository cardRepository;
    private final VoucherRepository voucherRepository;
    private final AccountService accountService;

    public DashboardController(UserRepository userRepository,
                               AccountRepository accountRepository,
                               TransactionRepository transactionRepository,
                               SupportTicketRepository ticketRepository,
                               AuditLogRepository auditLogRepository,
                               NotificationRepository notificationRepository,
                               SavingsAccountRepository savingsAccountRepository,
                               LoanRepository loanRepository,
                               CardRepository cardRepository,
                               VoucherRepository voucherRepository,
                               AccountService accountService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.ticketRepository = ticketRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.savingsAccountRepository = savingsAccountRepository;
        this.loanRepository = loanRepository;
        this.cardRepository = cardRepository;
        this.voucherRepository = voucherRepository;
        this.accountService = accountService;
    }

    private Customer getCustomerOrThrow(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Customer customer = user.getCustomer();
        if (customer == null) {
            throw new BadRequestException("Tài khoản của bạn không liên kết với hồ sơ Khách hàng.");
        }
        return customer;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminDashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalAccounts = accountRepository.count();
        long totalTransactions = transactionRepository.count();
        long auditLogCount = auditLogRepository.count();

        // Calculate simulated real-time CPU & RAM load for UI rendering
        int cpu = 25 + (int) (Math.random() * 20); // 25% - 45%
        double ram = 3.8 + (Math.random() * 0.8);  // 3.8GB - 4.6GB
        int sessions = 120 + (int) (Math.random() * 20); // 120 - 140

        return new AdminDashboardResponse(cpu, ram, sessions, totalUsers, totalAccounts, totalTransactions, auditLogCount);
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ManagerDashboardResponse getManagerDashboard() {
        List<Account> allAccounts = accountRepository.findAll();
        long totalAccounts = allAccounts.size();
        BigDecimal totalBalance = allAccounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeAccounts = allAccounts.stream()
                .filter(a -> a.getStatus() == AccountStatus.ACTIVE)
                .count();

        long frozenAccounts = allAccounts.stream()
                .filter(a -> a.getStatus() == AccountStatus.FROZEN)
                .count();

        List<AccountResponse> topRichAccounts = allAccounts.stream()
                .sorted((a, b) -> b.getBalance().compareTo(a.getBalance()))
                .limit(5)
                .map(accountService::toResponse)
                .collect(Collectors.toList());

        // Simple monthly transaction volume data points for manager chart
        List<BigDecimal> monthlyGrowth = List.of(
            BigDecimal.valueOf(120000000), 
            BigDecimal.valueOf(145000000), 
            BigDecimal.valueOf(180000000), 
            BigDecimal.valueOf(224000000)
        );

        return new ManagerDashboardResponse(totalAccounts, totalBalance, activeAccounts, frozenAccounts, topRichAccounts, monthlyGrowth);
    }

    @GetMapping("/support")
    @PreAuthorize("hasAnyRole('SUPPORT', 'MANAGER', 'ADMIN')")
    public SupportDashboardResponse getSupportDashboard() {
        List<SupportTicket> allTickets = ticketRepository.findAll();
        long totalTickets = allTickets.size();
        long pendingTickets = allTickets.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();
        long approvedTickets = allTickets.stream().filter(t -> "APPROVED".equalsIgnoreCase(t.getStatus())).count();
        long rejectedTickets = allTickets.stream().filter(t -> "REJECTED".equalsIgnoreCase(t.getStatus())).count();

        List<SupportTicketController.SupportTicketResponse> pendingList = allTickets.stream()
                .filter(t -> "PENDING".equalsIgnoreCase(t.getStatus()))
                .map(SupportTicketController.SupportTicketResponse::fromEntity)
                .collect(Collectors.toList());

        return new SupportDashboardResponse(totalTickets, pendingTickets, approvedTickets, rejectedTickets, pendingList);
    }

    @GetMapping("/customer")
    public CustomerDashboardResponse getCustomerDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = getCustomerOrThrow(userDetails);
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Account> accounts = accountRepository.findByCustomerId(customer.getId());
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeSavingsCount = savingsAccountRepository.findByCustomerId(customer.getId()).stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .count();

        long activeLoansCount = loanRepository.findByCustomerId(customer.getId()).stream()
                .filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus()))
                .count();

        long activeCardsCount = cardRepository.findByCustomerId(customer.getId()).stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .count();

        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(user.getId());

        long ownedVouchersCount = voucherRepository.findByCustomerId(customer.getId()).size();

        return new CustomerDashboardResponse(
                customer.getId(),
                customer.getFullName(),
                totalBalance,
                customer.getLoyaltyPoints(),
                activeSavingsCount,
                activeLoansCount,
                activeCardsCount,
                unreadNotifications,
                ownedVouchersCount
        );
    }

    // Records/DTO definitions for dashboard controller response
    public record AdminDashboardResponse(
        int cpu,
        double ram,
        int sessions,
        long totalUsers,
        long totalAccounts,
        long totalTransactions,
        long auditLogCount
    ) {}

    public record ManagerDashboardResponse(
        long totalAccounts,
        BigDecimal totalBalance,
        long activeAccountsCount,
        long frozenAccountsCount,
        List<AccountResponse> topAccounts,
        List<BigDecimal> monthlyGrowth
    ) {}

    public record SupportDashboardResponse(
        long totalTickets,
        long pendingTicketsCount,
        long approvedTicketsCount,
        long rejectedTicketsCount,
        List<SupportTicketController.SupportTicketResponse> pendingTickets
    ) {}

    public record CustomerDashboardResponse(
        Long customerId,
        String fullName,
        BigDecimal totalBalance,
        Integer loyaltyPoints,
        long activeSavingsCount,
        long activeLoansCount,
        long activeCardsCount,
        long unreadNotificationsCount,
        long ownedVouchersCount
    ) {}
}
