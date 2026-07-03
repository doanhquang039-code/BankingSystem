package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.BeneficiaryRequest;
import com.example.BankingSystem.dto.BeneficiaryResponse;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Beneficiary;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.BeneficiaryRepository;
import com.example.BankingSystem.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository,
                               UserRepository userRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.userRepository = userRepository;
    }

    /** Lấy danh sách người nhận của user hiện tại */
    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(String username) {
        User user = findUser(username);
        return beneficiaryRepository
                .findByOwnerUserIdAndIsActiveTrueOrderByAliasAsc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    /** Thêm người nhận mới */
    @Transactional
    public BeneficiaryResponse addBeneficiary(String username, BeneficiaryRequest request) {
        User user = findUser(username);

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setOwnerUser(user);
        beneficiary.setAlias(request.alias());
        beneficiary.setAccountNumber(request.accountNumber());
        beneficiary.setBankName(request.bankName());
        beneficiary.setBeneficiaryName(request.beneficiaryName());
        beneficiary.setIsActive(true);
        beneficiary.setCreatedAt(LocalDateTime.now());
        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    /** Cập nhật alias */
    @Transactional
    public BeneficiaryResponse updateAlias(Long id, String username, String newAlias) {
        User user = findUser(username);
        Beneficiary beneficiary = beneficiaryRepository
                .findByIdAndOwnerUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found: " + id));
        beneficiary.setAlias(newAlias);
        beneficiary.setUpdatedAt(LocalDateTime.now());
        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    /** Xóa mềm người nhận (set isActive = false) */
    @Transactional
    public void deleteBeneficiary(Long id, String username) {
        User user = findUser(username);
        Beneficiary beneficiary = beneficiaryRepository
                .findByIdAndOwnerUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found: " + id));
        beneficiary.setIsActive(false);
        beneficiary.setUpdatedAt(LocalDateTime.now());
        beneficiaryRepository.save(beneficiary);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private BeneficiaryResponse toResponse(Beneficiary b) {
        return new BeneficiaryResponse(
                b.getId(), b.getAlias(), b.getAccountNumber(),
                b.getBankName(), b.getBeneficiaryName(), b.getCreatedAt());
    }
}
