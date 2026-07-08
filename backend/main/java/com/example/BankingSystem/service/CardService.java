package com.example.BankingSystem.service;

import com.example.BankingSystem.exception.BadRequestException;
import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.Card;
import com.example.BankingSystem.model.Customer;
import com.example.BankingSystem.repository.CardRepository;
import com.example.BankingSystem.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class CardService {
    private final CardRepository cardRepository;
    private final CustomerRepository customerRepository;
    private final Random random = new Random();

    public CardService(CardRepository cardRepository, CustomerRepository customerRepository) {
        this.cardRepository = cardRepository;
        this.customerRepository = customerRepository;
    }

    public List<Card> getCardsForCustomer(Long customerId) {
        return cardRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Card issueCard(Long customerId, String cardType) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Sinh số thẻ ngẫu nhiên 16 số bắt đầu bằng 4 (Visa) hoặc 5 (MasterCard)
        String prefix = cardType.equalsIgnoreCase("CREDIT") ? "5222" : "4111";
        String cardNumber = prefix + String.format("%012d", random.nextLong(1000000000000L));

        LocalDate exp = LocalDate.now().plusYears(5);
        String expirationDate = String.format("%02d/%02d", exp.getMonthValue(), exp.getYear() % 100);
        String cvv = String.format("%03d", random.nextInt(1000));

        BigDecimal limit = cardType.equalsIgnoreCase("CREDIT") ? BigDecimal.valueOf(50000000.00) : BigDecimal.ZERO;

        Card card = new Card(
                customerId,
                cardNumber,
                cardType.toUpperCase(),
                customer.getFullName().toUpperCase(),
                expirationDate,
                cvv,
                limit,
                "ACTIVE"
        );

        return cardRepository.save(card);
    }

    @Transactional
    public Card toggleCardStatus(Long customerId, String cardNumber) {
        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Thẻ không tồn tại"));

        if (!card.getCustomerId().equals(customerId)) {
            throw new BadRequestException("Bạn không sở hữu thẻ này");
        }

        String newStatus = card.getStatus().equalsIgnoreCase("ACTIVE") ? "LOCKED" : "ACTIVE";
        card.setStatus(newStatus);
        return cardRepository.save(card);
    }
}
