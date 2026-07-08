package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthViewController {

    @GetMapping("/login")
    public String login() {
        return "login"; // Trả về templates/login.html
    }

    @GetMapping("/register")
    public String register() {
        return "forward:/index.html";
    }

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}
