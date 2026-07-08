package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CustomerViewController {

    @GetMapping({"/settings", "/notifications"})
    public String customerSettings() {
        return "forward:/index.html";
    }
}
