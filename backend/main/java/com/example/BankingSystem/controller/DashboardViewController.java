package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardViewController {

    @GetMapping({"/dashboard", "/manager-dashboard"})
    public String dashboard() {
        return "forward:/index.html";
    }
}
