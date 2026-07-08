package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SupportViewController {

    @GetMapping("/support-center")
    public String support() {
        return "forward:/index.html";
    }
}
