package com.example.BankingSystem.service;

import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.*;
import com.example.BankingSystem.repository.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GamificationService {

    private final LanguageLessonRepository lessonRepository;
    private final CustomerLessonRepository customerLessonRepository;
    private final VoucherRepository voucherRepository;
    private final CustomerRepository customerRepository;

    public GamificationService(
            LanguageLessonRepository lessonRepository,
            CustomerLessonRepository customerLessonRepository,
            VoucherRepository voucherRepository,
            CustomerRepository customerRepository) {
        this.lessonRepository = lessonRepository;
        this.customerLessonRepository = customerLessonRepository;
        this.voucherRepository = voucherRepository;
        this.customerRepository = customerRepository;
    }

    // DTO records
    public record LessonDto(
            Long id,
            String title,
            String content,
            String question,
            List<String> options,
            boolean completed,
            int pointsReward
    ) {}

    public record SubmitResponse(
            boolean correct,
            String message,
            int pointsEarned
    ) {}

    public record VoucherDto(
            Long id,
            String code,
            String title,
            BigDecimal discountAmount,
            Integer pointCost,
            boolean redeemed
    ) {}

    @Cacheable(value = "lessons", key = "#customerId")
    @Transactional(readOnly = true)
    public List<LessonDto> getLessonsForCustomer(Long customerId) {
        List<LanguageLesson> lessons = lessonRepository.findAll();
        List<CustomerLesson> completed = customerLessonRepository.findByCustomerId(customerId);
        
        List<Long> completedIds = completed.stream()
                .map(CustomerLesson::getLessonId)
                .toList();

        List<LessonDto> dtos = new ArrayList<>();
        for (LanguageLesson lesson : lessons) {
            List<String> opts = Arrays.asList(lesson.getOptions().split(","));
            dtos.add(new LessonDto(
                    lesson.getId(),
                    lesson.getTitle(),
                    lesson.getContent(),
                    lesson.getQuestion(),
                    opts,
                    completedIds.contains(lesson.getId()),
                    lesson.getPointsReward()
            ));
        }
        return dtos;
    }

    @CacheEvict(value = "lessons", key = "#customerId")
    @Transactional
    public SubmitResponse submitAnswer(Long customerId, Long lessonId, String answer) {
        LanguageLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        boolean isCorrect = lesson.getCorrectAnswer().equalsIgnoreCase(answer.trim());
        if (!isCorrect) {
            return new SubmitResponse(false, "Đáp án chưa chính xác, hãy thử lại nhé!", 0);
        }

        // Kiểm tra xem đã hoàn thành chưa
        boolean alreadyCompleted = customerLessonRepository.existsByCustomerIdAndLessonId(customerId, lessonId);
        if (alreadyCompleted) {
            return new SubmitResponse(true, "Chính xác! Tuy nhiên bài học này bạn đã hoàn thành và nhận điểm trước đó rồi.", 0);
        }

        // Ghi nhận hoàn thành bài học
        customerLessonRepository.save(new CustomerLesson(customerId, lessonId));

        // Cộng điểm thưởng cho khách hàng
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        int points = lesson.getPointsReward();
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        customerRepository.save(customer);

        return new SubmitResponse(true, "Chính xác! Chúc mừng bạn đã hoàn thành bài học và được cộng " + points + " điểm thưởng!", points);
    }

    @Cacheable(value = "vouchers", key = "'shop'")
    @Transactional(readOnly = true)
    public List<VoucherDto> getVouchersShop() {
        return voucherRepository.findByCustomerNull().stream()
                .map(v -> new VoucherDto(v.getId(), v.getCode(), v.getTitle(), v.getDiscountAmount(), v.getPointCost(), false))
                .toList();
    }

    @Cacheable(value = "vouchers", key = "'customer:' + #customerId")
    @Transactional(readOnly = true)
    public List<VoucherDto> getCustomerVouchers(Long customerId) {
        return voucherRepository.findByCustomerId(customerId).stream()
                .map(v -> new VoucherDto(v.getId(), v.getCode(), v.getTitle(), v.getDiscountAmount(), v.getPointCost(), true))
                .toList();
    }

    @CacheEvict(value = "vouchers", allEntries = true)
    @Transactional
    public VoucherDto redeemVoucher(Long customerId, Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));

        if (voucher.getCustomer() != null) {
            throw new BadRequestException("Phiếu giảm giá này đã được quy đổi bởi khách hàng khác!");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.getLoyaltyPoints() < voucher.getPointCost()) {
            throw new BadRequestException("Bạn không đủ điểm tích lũy để quy đổi Phiếu giảm giá này!");
        }

        // Trừ điểm và liên kết voucher
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - voucher.getPointCost());
        customerRepository.save(customer);

        voucher.setCustomer(customer);
        voucherRepository.save(voucher);

        return new VoucherDto(voucher.getId(), voucher.getCode(), voucher.getTitle(), voucher.getDiscountAmount(), voucher.getPointCost(), true);
    }
}
