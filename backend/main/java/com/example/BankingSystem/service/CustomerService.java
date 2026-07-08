package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.CreateCustomerRequest;
import com.example.BankingSystem.dto.CustomerResponse;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.repository.CustomerRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(Long id) {
        return toResponse(findCustomer(id));
    }

    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.email())) {
            throw new BadRequestException("customer.email.exists");
        }
        if (customerRepository.existsByPhone(request.phone())) {
            throw new BadRequestException("customer.phone.exists");
        }

        Customer customer = new Customer();
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        return toResponse(customerRepository.save(customer));
    }

    public Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CreateCustomerRequest request) {
        Customer customer = findCustomer(id);

        if (!customer.getEmail().equalsIgnoreCase(request.email())) {
            if (customerRepository.existsByEmail(request.email())) {
                throw new BadRequestException("customer.email.exists");
            }
            customer.setEmail(request.email());
        }

        if (!customer.getPhone().equals(request.phone())) {
            if (customerRepository.existsByPhone(request.phone())) {
                throw new BadRequestException("customer.phone.exists");
            }
            customer.setPhone(request.phone());
        }

        customer.setFullName(request.fullName());
        return toResponse(customerRepository.save(customer));
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCreatedAt(),
                customer.getLoyaltyPoints()
        );
    }
}


