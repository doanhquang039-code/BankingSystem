package com.example.BankingSystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProductViewController {

    @GetMapping({"/savings", "/loans", "/cards"})
    public String products() {
        return "forward:/index.html";
    }
}
