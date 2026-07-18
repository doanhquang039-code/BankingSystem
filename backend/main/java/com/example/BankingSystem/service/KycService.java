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
import com.example.BankingSystem.annotation.Audit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * KYC (Know Your Customer) business logic.
 *
 * <h3>Workflow</h3>
 * <pre>
 *  [Customer] submit    → status: PENDING
 *  [Staff]    approve   → status: APPROVED  (+ notify customer)
 *  [Staff]    reject    → status: REJECTED  (+ notify customer with reason)
 *  [Customer] resubmit  → status: RESUBMITTED → treated as PENDING for staff
 * </pre>
 */
@Service
public class KycService {

    private final KycRequestRepository kycRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public KycService(KycRequestRepository kycRepository,
                      CustomerRepository customerRepository,
                      UserRepository userRepository,
                      NotificationService notificationService) {
        this.kycRepository = kycRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ── Customer Operations ───────────────────────────────────────────────────

    /**
     * Customer nộp hồ sơ KYC lần đầu hoặc resubmit sau khi bị từ chối.
     *
     * @param username username của user đang đăng nhập (phải là CUSTOMER)
     * @param request  thông tin hồ sơ KYC
     */
    @Transactional
    public KycResponse submitKyc(String username, KycSubmitRequest request) {
        Customer customer = findCustomerByUsername(username);

        // Kiểm tra không có PENDING / APPROVED đang tồn tại
        boolean hasPendingOrApproved = kycRepository.existsByCustomerIdAndStatusIn(
                customer.getId(),
                List.of(KycStatus.PENDING, KycStatus.APPROVED, KycStatus.RESUBMITTED));

        if (hasPendingOrApproved) {
            throw new BadRequestException("kyc.already_pending_or_approved");
        }

        KycRequest kyc = new KycRequest();
        kyc.setCustomer(customer);
        kyc.setFullName(request.fullName());
        kyc.setIdNumber(request.idNumber());
        kyc.setIdType(request.idType());
        kyc.setFrontImageUrl(request.frontImageUrl());
        kyc.setBackImageUrl(request.backImageUrl());
        kyc.setSelfieUrl(request.selfieUrl());
        kyc.setStatus(KycStatus.PENDING);

        return toResponse(kycRepository.save(kyc));
    }

    /**
     * Customer resubmit sau khi bị từ chối (REJECTED → RESUBMITTED).
     */
    @Transactional
    public KycResponse resubmitKyc(Long kycId, String username, KycSubmitRequest request) {
        Customer customer = findCustomerByUsername(username);

        KycRequest kyc = kycRepository.findById(kycId)
                .filter(k -> k.getCustomer().getId().equals(customer.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("KYC request not found: " + kycId));

        if (kyc.getStatus() != KycStatus.REJECTED) {
            throw new BadRequestException("kyc.can_only_resubmit_rejected");
        }

        kyc.setFullName(request.fullName());
        kyc.setIdNumber(request.idNumber());
        kyc.setIdType(request.idType());
        kyc.setFrontImageUrl(request.frontImageUrl());
        kyc.setBackImageUrl(request.backImageUrl());
        kyc.setSelfieUrl(request.selfieUrl());
        kyc.setStatus(KycStatus.RESUBMITTED);
        kyc.setRejectionReason(null);
        kyc.setUpdatedAt(LocalDateTime.now());

        return toResponse(kycRepository.save(kyc));
    }

    /**
     * Customer xem trạng thái KYC mới nhất của mình.
     */
    @Transactional(readOnly = true)
    public KycResponse getMyKyc(String username) {
        Customer customer = findCustomerByUsername(username);
        return kycRepository.findTopByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No KYC request found"));
    }

    // ── Staff Operations ──────────────────────────────────────────────────────

    /**
     * Staff xem danh sách KYC cần duyệt (PENDING + RESUBMITTED).
     */
    @Transactional(readOnly = true)
    public Page<KycResponse> getPendingKycList(int page, int size) {
        // Combine PENDING và RESUBMITTED — cả hai đều cần staff review
        return kycRepository.findByStatusOrderByCreatedAtAsc(KycStatus.PENDING,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    /**
     * Staff xem KYC cần resubmit riêng.
     */
    @Transactional(readOnly = true)
    public Page<KycResponse> getResubmittedKycList(int page, int size) {
        return kycRepository.findByStatusOrderByCreatedAtAsc(KycStatus.RESUBMITTED,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    /**
     * Staff approve hoặc reject hồ sơ KYC.
     *
     * <p>Sau khi review, notification được gửi async tới customer
     * (DB persist + WebSocket push).
     *
     * @param kycId         ID của KYC request
     * @param staffUsername username của nhân viên duyệt
     * @param reviewRequest action (APPROVE/REJECT) và lý do từ chối
     */
    @Transactional
    @Audit(action = "KYC_REVIEW")
    public KycResponse reviewKyc(Long kycId, String staffUsername, KycReviewRequest reviewRequest) {
        KycRequest kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC request not found: " + kycId));

        if (kyc.getStatus() != KycStatus.PENDING && kyc.getStatus() != KycStatus.RESUBMITTED) {
            throw new BadRequestException("kyc.not_reviewable");
        }

        boolean isApprove = "APPROVE".equalsIgnoreCase(reviewRequest.action());

        if (!isApprove && (reviewRequest.rejectionReason() == null
                || reviewRequest.rejectionReason().isBlank())) {
            throw new BadRequestException("kyc.rejection_reason_required");
        }

        kyc.setStatus(isApprove ? KycStatus.APPROVED : KycStatus.REJECTED);
        kyc.setReviewedBy(staffUsername);
        kyc.setReviewedAt(LocalDateTime.now());
        kyc.setUpdatedAt(LocalDateTime.now());

        if (!isApprove) {
            kyc.setRejectionReason(reviewRequest.rejectionReason());
        }

        KycRequest saved = kycRepository.save(kyc);

        // Gửi notification async cho customer (DB + WebSocket push)
        notifyCustomer(saved, isApprove);

        return toResponse(saved);
    }

    // ── Admin Operations ──────────────────────────────────────────────────────

    /**
     * Admin xem tất cả KYC requests (có phân trang).
     */
    @Transactional(readOnly = true)
    public Page<KycResponse> getAllKyc(int page, int size) {
        return kycRepository.findAll(PageRequest.of(page, size)).map(this::toResponse);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Customer findCustomerByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        if (user.getCustomer() == null) {
            throw new BadRequestException("kyc.not_a_customer");
        }
        return user.getCustomer();
    }

    private void notifyCustomer(KycRequest kyc, boolean isApprove) {
        try {
            User owner = userRepository.findByCustomerId(kyc.getCustomer().getId()).orElse(null);
            if (owner == null) return;

            String title, body;
            if (isApprove) {
                title = "KYC được phê duyệt ✓";
                body = "Hồ sơ xác minh danh tính của bạn đã được chấp thuận. Tài khoản được mở khóa đầy đủ.";
            } else {
                title = "KYC bị từ chối";
                body = "Hồ sơ xác minh danh tính bị từ chối. Lý do: " + kyc.getRejectionReason()
                        + ". Vui lòng chỉnh sửa và nộp lại.";
            }

            notificationService.sendAsync(owner.getId(), "KYC", title, body, "kyc_requests", kyc.getId());
        } catch (Exception ignored) {}
    }

    private KycResponse toResponse(KycRequest k) {
        return new KycResponse(
                k.getId(),
                k.getCustomer().getId(),
                k.getCustomer().getFullName(),
                k.getFullName(),
                k.getIdNumber(),
                k.getIdType(),
                k.getFrontImageUrl(),
                k.getBackImageUrl(),
                k.getSelfieUrl(),
                k.getStatus(),
                k.getRejectionReason(),
                k.getReviewedBy(),
                k.getCreatedAt(),
                k.getReviewedAt()
        );
    }
}
