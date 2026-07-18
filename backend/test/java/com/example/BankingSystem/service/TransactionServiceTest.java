package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.MoneyOperationRequest;
import com.example.BankingSystem.dto.TransactionResponse;
import com.example.BankingSystem.dto.TransferRequest;
import com.example.BankingSystem.enums.TransactionType;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.model.Account;
import com.example.BankingSystem.model.BankTransaction;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.AccountRepository;
import com.example.BankingSystem.repository.TransactionRepository;
import com.example.BankingSystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link TransactionService}.
 *
 * <p>Uses Mockito to isolate the service from the database.
 * Key scenarios covered:
 * <ul>
 *   <li>Deposit: balance increases, notification sent</li>
 *   <li>Withdraw: balance decreases, insufficient balance rejected</li>
 *   <li>Transfer: atomic debit/credit, deadlock-safe ordering, same-account rejected</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Unit Tests")
class TransactionServiceTest {

    @Mock private AccountService accountService;
    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private TransactionService transactionService;

    private Account sourceAccount;
    private Account destinationAccount;
    private Customer customer;
    private User user;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setFullName("Test Customer");
        customer.setEmail("test@example.com");
        customer.setPhone("0901234567");

        user = new User();
        user.setId(10L);
        user.setUsername("testuser");
        user.setCustomer(customer);

        sourceAccount = new Account();
        sourceAccount.setId(1L);
        sourceAccount.setAccountNumber("ACC000001");
        sourceAccount.setBalance(new BigDecimal("10000000"));
        sourceAccount.setCustomer(customer);

        destinationAccount = new Account();
        destinationAccount.setId(2L);
        destinationAccount.setAccountNumber("ACC000002");
        destinationAccount.setBalance(new BigDecimal("5000000"));
        destinationAccount.setCustomer(customer);
    }

    private BankTransaction mockSavedTransaction(TransactionType type, BigDecimal amount) {
        BankTransaction tx = new BankTransaction();
        tx.setId(100L);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setCreatedAt(LocalDateTime.now());
        if (type == TransactionType.DEPOSIT || type == TransactionType.TRANSFER) {
            tx.setDestinationAccount(destinationAccount);
        }
        if (type == TransactionType.WITHDRAW || type == TransactionType.TRANSFER) {
            tx.setSourceAccount(sourceAccount);
        }
        return tx;
    }

    // ── DEPOSIT ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Deposit Tests")
    class DepositTests {

        @Test
        @DisplayName("Deposit should increase account balance")
        void deposit_shouldIncreaseBalance() {
            BigDecimal depositAmount = new BigDecimal("2000000");
            MoneyOperationRequest request = new MoneyOperationRequest(depositAmount, "Salary");
            BigDecimal expectedBalance = new BigDecimal("12000000");

            when(accountService.findActiveAccountWithLock("ACC000001")).thenReturn(sourceAccount);
            when(accountRepository.save(any())).thenReturn(sourceAccount);
            when(transactionRepository.save(any())).thenReturn(mockSavedTransaction(TransactionType.DEPOSIT, depositAmount));

            TransactionResponse response = transactionService.deposit("ACC000001", request);

            assertThat(sourceAccount.getBalance()).isEqualByComparingTo(expectedBalance);
            assertThat(response).isNotNull();
            assertThat(response.type()).isEqualTo(TransactionType.DEPOSIT);
            verify(accountRepository).save(sourceAccount);
            verify(transactionRepository).save(any(BankTransaction.class));
        }

        @Test
        @DisplayName("Deposit should trigger async notification")
        void deposit_shouldTriggerNotification() {
            MoneyOperationRequest request = new MoneyOperationRequest(new BigDecimal("1000000"), "Test");
            when(accountService.findActiveAccountWithLock(any())).thenReturn(sourceAccount);
            when(accountRepository.save(any())).thenReturn(sourceAccount);
            when(transactionRepository.save(any())).thenReturn(mockSavedTransaction(TransactionType.DEPOSIT, new BigDecimal("1000000")));
            when(userRepository.findByCustomerId(customer.getId())).thenReturn(Optional.of(user));

            transactionService.deposit("ACC000001", request);

            verify(notificationService).sendAsync(eq(user.getId()), eq("CREDIT"), anyString(), anyString(), eq("transactions"), anyLong());
        }
    }

    // ── WITHDRAW ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Withdraw Tests")
    class WithdrawTests {

        @Test
        @DisplayName("Withdraw should decrease account balance")
        void withdraw_shouldDecreaseBalance() {
            BigDecimal withdrawAmount = new BigDecimal("3000000");
            MoneyOperationRequest request = new MoneyOperationRequest(withdrawAmount, "ATM");
            BigDecimal expectedBalance = new BigDecimal("7000000");

            when(accountService.findActiveAccountWithLock("ACC000001")).thenReturn(sourceAccount);
            when(accountRepository.save(any())).thenReturn(sourceAccount);
            when(transactionRepository.save(any())).thenReturn(mockSavedTransaction(TransactionType.WITHDRAW, withdrawAmount));

            transactionService.withdraw("ACC000001", request);

            assertThat(sourceAccount.getBalance()).isEqualByComparingTo(expectedBalance);
        }

        @Test
        @DisplayName("Withdraw with insufficient balance should throw BadRequestException")
        void withdraw_insufficientBalance_shouldThrow() {
            BigDecimal excessiveAmount = new BigDecimal("99999999");
            MoneyOperationRequest request = new MoneyOperationRequest(excessiveAmount, "ATM");

            when(accountService.findActiveAccountWithLock("ACC000001")).thenReturn(sourceAccount);

            assertThatThrownBy(() -> transactionService.withdraw("ACC000001", request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("transaction.insufficient_balance");

            verify(accountRepository, never()).save(any());
            verify(transactionRepository, never()).save(any());
        }
    }

    // ── TRANSFER ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Transfer Tests")
    class TransferTests {

        @Test
        @DisplayName("Transfer should debit source and credit destination")
        void transfer_shouldDebitSourceAndCreditDestination() {
            BigDecimal amount = new BigDecimal("2000000");
            TransferRequest request = new TransferRequest("ACC000001", "ACC000002", amount, "Rent");

            // "ACC000001" < "ACC000002" alphabetically → source locked first
            when(accountService.findActiveAccountWithLock("ACC000001")).thenReturn(sourceAccount);
            when(accountService.findActiveAccountWithLock("ACC000002")).thenReturn(destinationAccount);
            when(accountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any())).thenReturn(mockSavedTransaction(TransactionType.TRANSFER, amount));

            transactionService.transfer(request);

            assertThat(sourceAccount.getBalance()).isEqualByComparingTo(new BigDecimal("8000000"));
            assertThat(destinationAccount.getBalance()).isEqualByComparingTo(new BigDecimal("7000000"));

            ArgumentCaptor<Account> savedCaptor = ArgumentCaptor.forClass(Account.class);
            verify(accountRepository, times(2)).save(savedCaptor.capture());
        }

        @Test
        @DisplayName("Transfer to same account should throw BadRequestException")
        void transfer_sameAccount_shouldThrow() {
            TransferRequest request = new TransferRequest("ACC000001", "ACC000001",
                    new BigDecimal("1000"), "Self");

            assertThatThrownBy(() -> transactionService.transfer(request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("transaction.same_account");

            verifyNoInteractions(accountService, accountRepository, transactionRepository);
        }

        @Test
        @DisplayName("Transfer with insufficient balance should throw BadRequestException")
        void transfer_insufficientBalance_shouldThrow() {
            BigDecimal tooMuch = new BigDecimal("50000000");
            TransferRequest request = new TransferRequest("ACC000001", "ACC000002", tooMuch, "Test");

            when(accountService.findActiveAccountWithLock("ACC000001")).thenReturn(sourceAccount);
            when(accountService.findActiveAccountWithLock("ACC000002")).thenReturn(destinationAccount);

            assertThatThrownBy(() -> transactionService.transfer(request))
                    .isInstanceOf(BadRequestException.class);

            verify(accountRepository, never()).save(any());
        }

        @Test
        @DisplayName("Transfer sends notifications to both sender and receiver")
        void transfer_shouldNotifyBothParties() {
            BigDecimal amount = new BigDecimal("1000000");
            TransferRequest request = new TransferRequest("ACC000001", "ACC000002", amount, "Test");

            when(accountService.findActiveAccountWithLock("ACC000001")).thenReturn(sourceAccount);
            when(accountService.findActiveAccountWithLock("ACC000002")).thenReturn(destinationAccount);
            when(accountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any())).thenReturn(mockSavedTransaction(TransactionType.TRANSFER, amount));
            when(userRepository.findByCustomerId(customer.getId())).thenReturn(Optional.of(user));

            transactionService.transfer(request);

            // Notification for sender (DEBIT) + receiver (CREDIT)
            verify(notificationService, times(2))
                    .sendAsync(anyLong(), anyString(), anyString(), anyString(), eq("transactions"), anyLong());
        }
    }
}
