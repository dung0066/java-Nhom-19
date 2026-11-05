package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByPublishedTrueOrderByCreatedAtDesc();

    List<Article> findAllByOrderByCreatedAtDesc();

    List<Article> findByCategoryAndPublishedTrueOrderByCreatedAtDesc(String category);
}

