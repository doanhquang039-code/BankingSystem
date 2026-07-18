package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.KycReviewRequest;
import com.example.BankingSystem.dto.KycResponse;
import com.example.BankingSystem.dto.KycSubmitRequest;
import com.example.BankingSystem.enums.KycStatus;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.model.KycRequest;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.CustomerRepository;
import com.example.BankingSystem.repository.KycRequestRepository;
import com.example.BankingSystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link KycService}.
 *
 * <p>Covers the full KYC lifecycle:
 * <ul>
 *   <li>Submit: happy path, duplicate prevention</li>
 *   <li>Resubmit: only allowed on REJECTED</li>
 *   <li>Review: approve / reject, notification sent, rejection reason required</li>
 *   <li>Get own KYC: found / not found</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("KycService Unit Tests")
class KycServiceTest {

    @Mock private KycRequestRepository kycRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private KycService kycService;

    private Customer customer;
    private User user;
    private KycSubmitRequest submitRequest;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setFullName("Nguyen Van A");
        customer.setEmail("nguyenvana@example.com");
        customer.setPhone("0901234567");

        user = new User();
        user.setId(10L);
        user.setUsername("customer1");
        user.setCustomer(customer);

        submitRequest = new KycSubmitRequest(
                "Nguyen Van A",
                "001085012345",
                "CCCD",
                "https://cdn.example.com/front.jpg",
                "https://cdn.example.com/back.jpg",
                "https://cdn.example.com/selfie.jpg"
        );
    }

    // ── SUBMIT ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Submit KYC")
    class SubmitTests {

        @Test
        @DisplayName("First-time submission should create PENDING record")
        void submit_firstTime_shouldCreatePendingRecord() {
            when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
            when(kycRepository.existsByCustomerIdAndStatusIn(eq(customer.getId()), anyList())).thenReturn(false);

            KycRequest savedKyc = buildKycRequest(KycStatus.PENDING);
            when(kycRepository.save(any())).thenReturn(savedKyc);

            KycResponse response = kycService.submitKyc("customer1", submitRequest);

            assertThat(response).isNotNull();
            assertThat(response.status()).isEqualTo(KycStatus.PENDING);
            assertThat(response.fullName()).isEqualTo("Nguyen Van A");
            verify(kycRepository).save(any(KycRequest.class));
        }

        @Test
        @DisplayName("Submit when PENDING already exists should throw BadRequestException")
        void submit_whenPendingExists_shouldThrow() {
            when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
            when(kycRepository.existsByCustomerIdAndStatusIn(eq(customer.getId()), anyList())).thenReturn(true);

            assertThatThrownBy(() -> kycService.submitKyc("customer1", submitRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("kyc.already_pending_or_approved");

            verify(kycRepository, never()).save(any());
        }

        @Test
        @DisplayName("Submit by non-customer user should throw BadRequestException")
        void submit_byNonCustomer_shouldThrow() {
            User staffUser = new User();
            staffUser.setId(99L);
            staffUser.setUsername("staff1");
            staffUser.setCustomer(null); // no customer link

            when(userRepository.findByUsername("staff1")).thenReturn(Optional.of(staffUser));

            assertThatThrownBy(() -> kycService.submitKyc("staff1", submitRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("kyc.not_a_customer");
        }
    }

    // ── RESUBMIT ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Resubmit KYC")
    class ResubmitTests {

        @Test
        @DisplayName("Resubmit a REJECTED KYC should change status to RESUBMITTED")
        void resubmit_rejectedKyc_shouldSucceed() {
            KycRequest rejected = buildKycRequest(KycStatus.REJECTED);
            rejected.setRejectionReason("Image too blurry");

            when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
            when(kycRepository.findById(1L)).thenReturn(Optional.of(rejected));

            KycRequest resubmitted = buildKycRequest(KycStatus.RESUBMITTED);
            when(kycRepository.save(any())).thenReturn(resubmitted);

            KycResponse response = kycService.resubmitKyc(1L, "customer1", submitRequest);

            assertThat(response.status()).isEqualTo(KycStatus.RESUBMITTED);
        }

        @Test
        @DisplayName("Resubmit a PENDING KYC should throw BadRequestException")
        void resubmit_pendingKyc_shouldThrow() {
            KycRequest pending = buildKycRequest(KycStatus.PENDING);

            when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
            when(kycRepository.findById(1L)).thenReturn(Optional.of(pending));

            assertThatThrownBy(() -> kycService.resubmitKyc(1L, "customer1", submitRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("kyc.can_only_resubmit_rejected");
        }
    }

    // ── REVIEW ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Review KYC (Staff)")
    class ReviewTests {

        @Test
        @DisplayName("Approve a PENDING KYC should change status to APPROVED and notify customer")
        void review_approve_shouldSetApprovedAndNotify() {
            KycRequest pending = buildKycRequest(KycStatus.PENDING);
            KycRequest approved = buildKycRequest(KycStatus.APPROVED);
            approved.setReviewedBy("staff1");
            approved.setReviewedAt(LocalDateTime.now());

            when(kycRepository.findById(1L)).thenReturn(Optional.of(pending));
            when(kycRepository.save(any())).thenReturn(approved);
            when(userRepository.findByCustomerId(customer.getId())).thenReturn(Optional.of(user));

            KycReviewRequest reviewRequest = new KycReviewRequest("APPROVE", null);
            KycResponse response = kycService.reviewKyc(1L, "staff1", reviewRequest);

            assertThat(response.status()).isEqualTo(KycStatus.APPROVED);
            assertThat(response.reviewedBy()).isEqualTo("staff1");
            verify(notificationService).sendAsync(eq(user.getId()), eq("KYC"),
                    contains("phê duyệt"), anyString(), eq("kyc_requests"), anyLong());
        }

        @Test
        @DisplayName("Reject a PENDING KYC should change status to REJECTED with reason")
        void review_reject_shouldSetRejectedWithReason() {
            KycRequest pending = buildKycRequest(KycStatus.PENDING);
            KycRequest rejected = buildKycRequest(KycStatus.REJECTED);
            rejected.setRejectionReason("Blurry images");
            rejected.setReviewedBy("staff1");

            when(kycRepository.findById(1L)).thenReturn(Optional.of(pending));
            when(kycRepository.save(any())).thenReturn(rejected);
            when(userRepository.findByCustomerId(customer.getId())).thenReturn(Optional.of(user));

            KycReviewRequest reviewRequest = new KycReviewRequest("REJECT", "Blurry images");
            KycResponse response = kycService.reviewKyc(1L, "staff1", reviewRequest);

            assertThat(response.status()).isEqualTo(KycStatus.REJECTED);
            assertThat(response.rejectionReason()).isEqualTo("Blurry images");
            verify(notificationService).sendAsync(eq(user.getId()), eq("KYC"),
                    contains("từ chối"), anyString(), eq("kyc_requests"), anyLong());
        }

        @Test
        @DisplayName("Reject without reason should throw BadRequestException")
        void review_reject_withoutReason_shouldThrow() {
            KycRequest pending = buildKycRequest(KycStatus.PENDING);
            when(kycRepository.findById(1L)).thenReturn(Optional.of(pending));

            KycReviewRequest reviewRequest = new KycReviewRequest("REJECT", "");

            assertThatThrownBy(() -> kycService.reviewKyc(1L, "staff1", reviewRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("kyc.rejection_reason_required");

            verify(kycRepository, never()).save(any());
        }

        @Test
        @DisplayName("Review an already APPROVED KYC should throw BadRequestException")
        void review_alreadyApproved_shouldThrow() {
            KycRequest approved = buildKycRequest(KycStatus.APPROVED);
            when(kycRepository.findById(1L)).thenReturn(Optional.of(approved));

            KycReviewRequest reviewRequest = new KycReviewRequest("APPROVE", null);

            assertThatThrownBy(() -> kycService.reviewKyc(1L, "staff1", reviewRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("kyc.not_reviewable");
        }
    }

    // ── GET MY KYC ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Get My KYC Status")
    class GetMyKycTests {

        @Test
        @DisplayName("Customer should see their latest KYC status")
        void getMyKyc_shouldReturnLatestRecord() {
            when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
            KycRequest latest = buildKycRequest(KycStatus.APPROVED);
            when(kycRepository.findTopByCustomerIdOrderByCreatedAtDesc(customer.getId()))
                    .thenReturn(Optional.of(latest));

            KycResponse response = kycService.getMyKyc("customer1");

            assertThat(response.status()).isEqualTo(KycStatus.APPROVED);
        }

        @Test
        @DisplayName("Customer with no KYC should get ResourceNotFoundException")
        void getMyKyc_noRecord_shouldThrow() {
            when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(user));
            when(kycRepository.findTopByCustomerIdOrderByCreatedAtDesc(customer.getId()))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> kycService.getMyKyc("customer1"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private KycRequest buildKycRequest(KycStatus status) {
        KycRequest kyc = new KycRequest();
        kyc.setId(1L);
        kyc.setCustomer(customer);
        kyc.setFullName("Nguyen Van A");
        kyc.setIdNumber("001085012345");
        kyc.setIdType("CCCD");
        kyc.setFrontImageUrl("https://cdn.example.com/front.jpg");
        kyc.setBackImageUrl("https://cdn.example.com/back.jpg");
        kyc.setSelfieUrl("https://cdn.example.com/selfie.jpg");
        kyc.setStatus(status);
        kyc.setCreatedAt(LocalDateTime.now());
        return kyc;
    }
}
