package com.example.BankingSystem.security;

import com.example.BankingSystem.enums.UserRole;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Xử lý sau khi OAuth2 (Google) login thành công:
 * 1. Lấy thông tin user từ Google profile
 * 2. Tạo mới user trong DB nếu chưa có (lần đầu đăng nhập)
 * 3. Generate JWT token
 * 4. Redirect về /api/auth/oauth2/success?token=xxx
 */
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            email = oAuth2User.getAttribute("preferred_username");
        }
        if (email == null) {
            throw new com.example.BankingSystem.exception.BadRequestException("Không tìm thấy email từ nhà cung cấp OAuth2.");
        }

        String name = oAuth2User.getAttribute("name");
        String externalId = oAuth2User.getAttribute("sub");
        if (externalId == null) {
            externalId = oAuth2User.getAttribute("oid");
        }
        if (externalId == null) {
            externalId = oAuth2User.getAttribute("id"); // Facebook/GitHub unique ID
        }
        if (externalId == null) {
            externalId = java.util.UUID.randomUUID().toString();
        }

        // Tìm hoặc tạo mới user theo email
        final String finalEmail = email;
        final String finalExternalId = externalId;
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = new User();
            // Username từ email (phần trước @), đảm bảo unique
            String baseUsername = finalEmail.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
            String username = ensureUniqueUsername(baseUsername);

            newUser.setUsername(username);
            newUser.setEmail(finalEmail);
            // Không có password (login qua OAuth2)
            newUser.setPassword("OAUTH2_NO_PASSWORD_" + finalExternalId);
            newUser.setRole(UserRole.CUSTOMER);
            newUser.setEnabled(true);
            newUser.setCreatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });

        // Cập nhật last_login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                        .build();

        String token = jwtUtil.generateToken(userDetails);

        // Redirect về frontend endpoint để tự động lưu token
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String encodedUsername = URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

        response.sendRedirect(frontendUrl + "/oauth2/redirect?token=" + encodedToken
                + "&username=" + encodedUsername
                + "&email=" + encodedEmail
                + "&role=" + user.getRole().name());
    }

    private String ensureUniqueUsername(String base) {
        String username = base;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + suffix++;
        }
        return username;
    }
}
