package com.example.BankingSystem.api;

import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Voucher;
import com.example.BankingSystem.repository.VoucherRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vouchers")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class VoucherController {

    private final VoucherRepository voucherRepository;

    public VoucherController(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @GetMapping
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Voucher createVoucher(@RequestBody CreateVoucherRequest request) {
        Voucher voucher = new Voucher();
        voucher.setCode(request.code());
        voucher.setTitle(request.title());
        voucher.setDiscountAmount(request.discountAmount());
        voucher.setPointCost(request.pointCost());
        voucher.setIsUsed(false);
        return voucherRepository.save(voucher);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVoucher(@PathVariable Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Voucher có ID: " + id));
        voucherRepository.delete(voucher);
    }

    public record CreateVoucherRequest(
        String code,
        String title,
        BigDecimal discountAmount,
        Integer pointCost
    ) {}
}
