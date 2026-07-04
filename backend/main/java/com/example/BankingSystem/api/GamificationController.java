package com.example.BankingSystem.api;

import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import com.example.BankingSystem.service.GamificationService;
import com.example.BankingSystem.service.GamificationService.LessonDto;
import com.example.BankingSystem.service.GamificationService.SubmitResponse;
import com.example.BankingSystem.service.GamificationService.VoucherDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    public GamificationController(GamificationService gamificationService, UserRepository userRepository) {
        this.gamificationService = gamificationService;
        this.userRepository = userRepository;
    }

    private Customer getCustomerOrThrow(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Customer customer = user.getCustomer();
        if (customer == null) {
            throw new BadRequestException("Tài khoản của bạn không liên kết với hồ sơ Khách hàng để tham gia tích điểm!");
        }
        return customer;
    }

    @GetMapping("/lessons")
    public List<LessonDto> getLessons(@AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = getCustomerOrThrow(userDetails);
        return gamificationService.getLessonsForCustomer(customer.getId());
    }

    @PostMapping("/lessons/{id}/submit")
    public SubmitResponse submitAnswer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam String answer) {
        Customer customer = getCustomerOrThrow(userDetails);
        return gamificationService.submitAnswer(customer.getId(), id, answer);
    }

    @GetMapping("/vouchers/shop")
    public List<VoucherDto> getVouchersShop() {
        return gamificationService.getVouchersShop();
    }

    @GetMapping("/vouchers/my")
    public List<VoucherDto> getMyVouchers(@AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = getCustomerOrThrow(userDetails);
        return gamificationService.getCustomerVouchers(customer.getId());
    }

    @PostMapping("/vouchers/{id}/redeem")
    public VoucherDto redeemVoucher(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Customer customer = getCustomerOrThrow(userDetails);
        return gamificationService.redeemVoucher(customer.getId(), id);
    }

    @GetMapping("/points")
    public Map<String, Integer> getPoints(@AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = getCustomerOrThrow(userDetails);
        Map<String, Integer> res = new HashMap<>();
        res.put("points", customer.getLoyaltyPoints());
        return res;
    }
}
