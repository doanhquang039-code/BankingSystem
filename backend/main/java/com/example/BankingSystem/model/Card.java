package com.example.BankingSystem.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "card_number", nullable = false, unique = true)
    private String cardNumber;

    @Column(name = "card_type", nullable = false)
    private String cardType; // DEBIT, CREDIT

    @Column(name = "holder_name", nullable = false)
    private String holderName;

    @Column(name = "expiration_date", nullable = false)
    private String expirationDate;

    @Column(nullable = false)
    private String cvv;

    @Column(name = "card_limit", nullable = false)
    private BigDecimal cardLimit;

    @Column(nullable = false)
    private String status; // ACTIVE, LOCKED

    public Card() {}

    public Card(Long customerId, String cardNumber, String cardType, String holderName, String expirationDate, String cvv, BigDecimal cardLimit, String status) {
        this.customerId = customerId;
        this.cardNumber = cardNumber;
        this.cardType = cardType;
        this.holderName = holderName;
        this.expirationDate = expirationDate;
        this.cvv = cvv;
        this.cardLimit = cardLimit;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }

    public String getExpirationDate() { return expirationDate; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public BigDecimal getCardLimit() { return cardLimit; }
    public void setCardLimit(BigDecimal cardLimit) { this.cardLimit = cardLimit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
