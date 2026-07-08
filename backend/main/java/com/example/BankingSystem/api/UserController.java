package com.example.BankingSystem.api;

import com.example.BankingSystem.enums.UserRole;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/toggle-status")
    public UserResponse toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng có ID: " + id));
        user.setEnabled(!user.getEnabled());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @PutMapping("/{id}/role")
    public UserResponse changeRole(@PathVariable Long id, @RequestParam UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng có ID: " + id));
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng có ID: " + id));
        userRepository.delete(user);
    }

    // User details response DTO to hide BCrypt password
    public record UserResponse(
            Long id,
            String username,
            String email,
            String role,
            Boolean enabled,
            Long customerId,
            String customerName,
            LocalDateTime createdAt,
            LocalDateTime lastLogin
    ) {
        public static UserResponse fromEntity(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getEnabled(),
                    user.getCustomer() != null ? user.getCustomer().getId() : null,
                    user.getCustomer() != null ? user.getCustomer().getFullName() : null,
                    user.getCreatedAt(),
                    user.getLastLogin()
            );
        }
    }
}
