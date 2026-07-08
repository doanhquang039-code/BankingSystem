package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.CreateCustomerRequest;
import com.example.BankingSystem.dto.CustomerResponse;
import com.example.BankingSystem.service.CustomerService;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService customerService;
    private final UserRepository userRepository;

    public CustomerController(CustomerService customerService, UserRepository userRepository) {
        this.customerService = customerService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public CustomerResponse getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return customerService.getCustomer(user.getCustomer().getId());
    }

    @PutMapping("/me")
    public CustomerResponse updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateCustomerRequest request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return customerService.updateCustomer(user.getCustomer().getId(), request);
    }

    @GetMapping
    public List<CustomerResponse> getCustomers() {
        return customerService.getCustomers();
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomer(@PathVariable Long id) {
        return customerService.getCustomer(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return customerService.createCustomer(request);
    }
}

