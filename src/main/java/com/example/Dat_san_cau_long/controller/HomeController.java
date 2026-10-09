package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final BranchRepository branchRepository;

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        model.addAttribute("branches", branchRepository.findAll());
        return "home";
    }

    @GetMapping({"/dat-san", "/booking", "/san"})
    public String booking(Model model) {
        model.addAttribute("branches", branchRepository.findAll());
        return "booking";
    }

    @GetMapping("/admin")
    public String admin() {
        return "admin";
    }
}

