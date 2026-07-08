package com.example.BankingSystem.service;

import com.example.BankingSystem.dto.LoginRequest;
import com.example.BankingSystem.dto.LoginResponse;
import com.example.BankingSystem.dto.RegisterRequest;
import com.example.BankingSystem.enums.UserRole;
import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.repository.UserRepository;
import com.example.BankingSystem.repository.CustomerRepository;
import com.example.BankingSystem.dto.CreateAccountRequest;
import com.example.BankingSystem.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final org.springframework.cache.CacheManager cacheManager;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    public AuthService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       AccountService accountService,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService,
                       org.springframework.cache.CacheManager cacheManager) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.accountService = accountService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.cacheManager = cacheManager;
    }

    /** Đăng nhập — trả về JWT token */
    public LoginResponse login(LoginRequest request) {
        // Kiểm tra CAPTCHA trước khi xác thực tài khoản mật khẩu
        org.springframework.cache.Cache cache = cacheManager.getCache("captcha");
        if (cache == null) {
            throw new BadRequestException("Hệ thống xác thực tạm thời không khả dụng");
        }
        String cachedCode = cache.get(request.captchaId(), String.class);
        if (cachedCode == null) {
            throw new BadRequestException("Mã xác thực CAPTCHA đã hết hạn. Vui lòng tải lại.");
        }
        if (!cachedCode.equalsIgnoreCase(request.captchaCode())) {
            throw new BadRequestException("Mã xác thực CAPTCHA không chính xác.");
        }
        // Xóa CAPTCHA để tránh brute-force dùng lại mã cũ
        cache.evict(request.captchaId());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (BadCredentialsException e) {
            throw new BadRequestException("auth.invalid_credentials");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.username()).orElseThrow();
        // Cập nhật last_login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        Long customerId = user.getCustomer() != null ? user.getCustomer().getId() : null;
        String customerName = user.getCustomer() != null ? user.getCustomer().getFullName() : null;

        return LoginResponse.of(token, user.getUsername(), user.getEmail(), user.getRole(), expirationMs, customerId, customerName);
    }

    /** Đăng ký tài khoản mới (role mặc định: CUSTOMER) */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("auth.username_taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("auth.email_taken");
        }
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
        customer = customerRepository.save(customer);

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setRole(UserRole.CUSTOMER);
        user.setEnabled(true);
        user.setCustomer(customer);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Tự động tạo 1 tài khoản thanh toán ban đầu với 50.000 VND
        accountService.createAccount(new CreateAccountRequest(customer.getId(), BigDecimal.valueOf(50000)));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtUtil.generateToken(userDetails);

        return LoginResponse.of(token, user.getUsername(), user.getEmail(), user.getRole(), expirationMs, customer.getId(), customer.getFullName());
    }
}
