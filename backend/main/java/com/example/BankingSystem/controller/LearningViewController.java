package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LearningViewController {

    @GetMapping("/learning")
    public String learning() {
        return "forward:/index.html";
    }
}
