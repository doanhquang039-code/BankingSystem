package com.example.BankingSystem.api;

import com.example.BankingSystem.model.Card;
import com.example.BankingSystem.model.User;
import com.example.BankingSystem.repository.UserRepository;
import com.example.BankingSystem.service.CardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    private final CardService cardService;
    private final UserRepository userRepository;

    public CardController(CardService cardService, UserRepository userRepository) {
        this.cardService = cardService;
        this.userRepository = userRepository;
    }

    public record IssueCardRequest(String cardType) {}

    @GetMapping("/me")
    public List<Card> getMyCards(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return cardService.getCardsForCustomer(user.getCustomer().getId());
    }

    @PostMapping
    public Card issueCard(@AuthenticationPrincipal UserDetails userDetails, @RequestBody IssueCardRequest request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return cardService.issueCard(user.getCustomer().getId(), request.cardType());
    }

    @PutMapping("/{cardNumber}/toggle")
    public Card toggleCardStatus(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String cardNumber) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
        if (user.getCustomer() == null) {
            throw new com.example.BankingSystem.exception.ResourceNotFoundException("Customer profile not found");
        }
        return cardService.toggleCardStatus(user.getCustomer().getId(), cardNumber);
    }
}
