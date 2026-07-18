package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.KycResponse;
import com.example.BankingSystem.dto.KycReviewRequest;
import com.example.BankingSystem.dto.KycSubmitRequest;
import com.example.BankingSystem.service.KycService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for KYC (Know Your Customer) workflow.
 *
 * <h3>Roles</h3>
 * <ul>
 *   <li>CUSTOMER – submit, resubmit, view own status</li>
 *   <li>MANAGER / SUPPORT (Staff) – view pending list, approve/reject</li>
 *   <li>ADMIN – view all KYC requests</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/kyc")
@Tag(name = "KYC", description = "Know Your Customer identity verification workflow")
public class KycController {

    private final KycService kycService;

    public KycController(KycService kycService) {
        this.kycService = kycService;
    }

    // ── Customer endpoints ────────────────────────────────────────────────────

    /**
     * Customer nộp hồ sơ KYC lần đầu.
     * POST /api/kyc/submit
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Customer submits KYC request")
    public ResponseEntity<KycResponse> submit(
            @Valid @RequestBody KycSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        KycResponse response = kycService.submitKyc(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Customer resubmit sau khi bị từ chối.
     * PUT /api/kyc/{id}/resubmit
     */
    @PutMapping("/{id}/resubmit")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Customer resubmits rejected KYC request")
    public ResponseEntity<KycResponse> resubmit(
            @PathVariable Long id,
            @Valid @RequestBody KycSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        KycResponse response = kycService.resubmitKyc(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Customer xem trạng thái KYC của mình.
     * GET /api/kyc/my
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Customer views their KYC status")
    public ResponseEntity<KycResponse> getMyKyc(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(kycService.getMyKyc(userDetails.getUsername()));
    }

    // ── Staff endpoints ───────────────────────────────────────────────────────

    /**
     * Staff xem danh sách KYC đang chờ duyệt (PENDING).
     * GET /api/kyc/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'SUPPORT', 'ADMIN')")
    @Operation(summary = "Staff views pending KYC list")
    public ResponseEntity<Page<KycResponse>> getPending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(kycService.getPendingKycList(page, size));
    }

    /**
     * Staff xem danh sách KYC được resubmit.
     * GET /api/kyc/resubmitted
     */
    @GetMapping("/resubmitted")
    @PreAuthorize("hasAnyRole('MANAGER', 'SUPPORT', 'ADMIN')")
    @Operation(summary = "Staff views resubmitted KYC list")
    public ResponseEntity<Page<KycResponse>> getResubmitted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(kycService.getResubmittedKycList(page, size));
    }

    /**
     * Staff approve hoặc reject hồ sơ KYC.
     * PUT /api/kyc/{id}/review
     */
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('MANAGER', 'SUPPORT', 'ADMIN')")
    @Operation(summary = "Staff approves or rejects a KYC request")
    public ResponseEntity<KycResponse> review(
            @PathVariable Long id,
            @Valid @RequestBody KycReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        KycResponse response = kycService.reviewKyc(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    /**
     * Admin xem tất cả KYC requests.
     * GET /api/kyc/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin views all KYC requests")
    public ResponseEntity<Page<KycResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(kycService.getAllKyc(page, size));
    }
}
