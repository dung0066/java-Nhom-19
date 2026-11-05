package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Article;
import com.example.Dat_san_cau_long.validation.OnCreate;
import com.example.Dat_san_cau_long.repository.ArticleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller Quản Lý Tin Tức & Bài Viết Dành Cho Quản Trị Viên (Admin)
 * Cho phép: Thêm bài mới, Chỉnh sửa, Bật/Tắt hiển thị, Xóa bài viết trong SQL Database
 */
@RestController
@RequestMapping("/api/admin/articles")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class AdminArticleController {

    private final ArticleRepository articleRepository;

    public AdminArticleController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticlesForAdmin() {
        return ResponseEntity.ok(articleRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@Validated(OnCreate.class) @RequestBody Article article) {
        article.setId(null);
        if (article.getPublished() == null) article.setPublished(true);
        if (article.getAuthor() == null || article.getAuthor().isBlank()) article.setAuthor("D2 Media");
        if (article.getCategory() == null || article.getCategory().isBlank()) article.setCategory("TIN_TUC");
        return ResponseEntity.ok(articleRepository.save(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @Validated(OnCreate.class) @RequestBody Article article) {
        return articleRepository.findById(id).map(existing -> {
            existing.setTitle(article.getTitle());
            existing.setSummary(article.getSummary());
            existing.setContent(article.getContent());
            existing.setImage(article.getImage());
            if (article.getCategory() != null) existing.setCategory(article.getCategory());
            if (article.getCategoryLabel() != null) existing.setCategoryLabel(article.getCategoryLabel());
            if (article.getAuthor() != null) existing.setAuthor(article.getAuthor());
            if (article.getReadTime() != null) existing.setReadTime(article.getReadTime());
            if (article.getPublished() != null) existing.setPublished(article.getPublished());
            return ResponseEntity.ok(articleRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Article> togglePublishStatus(@PathVariable Long id) {
        return articleRepository.findById(id).map(article -> {
            article.setPublished(!Boolean.TRUE.equals(article.getPublished()));
            return ResponseEntity.ok(articleRepository.save(article));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteArticle(@PathVariable Long id) {
        return articleRepository.findById(id).map(article -> {
            articleRepository.deleteById(id);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "success", true,
                    "message", "Đã xóa bài viết thành công khỏi SQL Database!"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}

