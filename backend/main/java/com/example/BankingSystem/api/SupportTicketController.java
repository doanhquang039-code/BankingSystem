package com.example.BankingSystem.api;

import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.model.SupportTicket;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.CustomerRepository;
import com.example.BankingSystem.repository.SupportTicketRepository;
import com.example.BankingSystem.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support-tickets")
public class SupportTicketController {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public SupportTicketController(SupportTicketRepository ticketRepository,
                                   UserRepository userRepository,
                                   CustomerRepository customerRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    private Customer getCustomerOrThrow(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy User"));
        Customer customer = user.getCustomer();
        if (customer == null) {
            throw new BadRequestException("Tài khoản của bạn không liên kết với hồ sơ Khách hàng.");
        }
        return customer;
    }

    @GetMapping("/me")
    public List<SupportTicketResponse> getMyTickets(@AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = getCustomerOrThrow(userDetails);
        return ticketRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(SupportTicketResponse::fromEntity)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupportTicketResponse createTicket(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestBody CreateTicketRequest request) {
        Customer customer = getCustomerOrThrow(userDetails);
        SupportTicket ticket = new SupportTicket();
        ticket.setCustomer(customer);
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setStatus("PENDING");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket = ticketRepository.save(ticket);
        return SupportTicketResponse.fromEntity(ticket);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPPORT', 'MANAGER', 'ADMIN')")
    public List<SupportTicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(SupportTicketResponse::fromEntity)
                .toList();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPPORT', 'MANAGER', 'ADMIN')")
    public SupportTicketResponse updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Ticket có ID: " + id));
        ticket.setStatus(status.toUpperCase());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket = ticketRepository.save(ticket);
        return SupportTicketResponse.fromEntity(ticket);
    }

    public record CreateTicketRequest(
        String title,
        String description
    ) {}

    public record SupportTicketResponse(
        Long id,
        Long customerId,
        String customerName,
        String title,
        String description,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static SupportTicketResponse fromEntity(SupportTicket ticket) {
            return new SupportTicketResponse(
                ticket.getId(),
                ticket.getCustomer() != null ? ticket.getCustomer().getId() : null,
                ticket.getCustomer() != null ? ticket.getCustomer().getFullName() : null,
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
            );
        }
    }
}
