package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Article;
import com.example.Dat_san_cau_long.repository.ArticleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller Public Dành Cho Khách Hàng (User) Xem Tin Tức Từ SQL
 */
@RestController
@RequestMapping("/api/articles")
public class ArticleApiController {

    private final ArticleRepository articleRepository;

    public ArticleApiController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Article>> getPublicArticles(@RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            return ResponseEntity.ok(articleRepository.findByCategoryAndPublishedTrueOrderByCreatedAtDesc(category.toUpperCase()));
        }
        return ResponseEntity.ok(articleRepository.findByPublishedTrueOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleDetail(@PathVariable Long id) {
        return articleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

