package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TransactionViewController {

    @GetMapping({"/transfer", "/beneficiaries", "/statement"})
    public String transactions() {
        return "forward:/index.html";
    }
}
