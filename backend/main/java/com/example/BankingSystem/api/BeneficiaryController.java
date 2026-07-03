package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.BeneficiaryRequest;
import com.example.BankingSystem.dto.BeneficiaryResponse;
import com.example.BankingSystem.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    /** GET /api/beneficiaries — Lấy danh sách người nhận của user hiện tại */
    @GetMapping
    public List<BeneficiaryResponse> getAll(@AuthenticationPrincipal UserDetails user) {
        return beneficiaryService.getBeneficiaries(user.getUsername());
    }

    /** POST /api/beneficiaries — Thêm người nhận mới */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse add(@AuthenticationPrincipal UserDetails user,
                                   @Valid @RequestBody BeneficiaryRequest request) {
        return beneficiaryService.addBeneficiary(user.getUsername(), request);
    }

    /** PATCH /api/beneficiaries/{id}/alias — Đổi tên gợi nhớ */
    @PatchMapping("/{id}/alias")
    public BeneficiaryResponse updateAlias(@AuthenticationPrincipal UserDetails user,
                                           @PathVariable Long id,
                                           @RequestParam String alias) {
        return beneficiaryService.updateAlias(id, user.getUsername(), alias);
    }

    /** DELETE /api/beneficiaries/{id} — Xóa người nhận */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserDetails user,
                       @PathVariable Long id) {
        beneficiaryService.deleteBeneficiary(id, user.getUsername());
    }
}
