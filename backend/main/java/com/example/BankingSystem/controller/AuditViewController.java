package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuditViewController {

    @GetMapping("/audit-logs")
    public String auditLogs() {
        return "forward:/index.html";
    }
}
