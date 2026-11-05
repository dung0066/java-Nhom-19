package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity Quản Lý Tin Tức & Bài Viết Cầu Lông D2 SHOP
 * Lưu trữ trong SQL Database
 */
@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(groups = OnCreate.class, message = "Tiêu đề bài viết không được để trống")
    @Size(max = 250, message = "Tiêu đề tối đa 250 ký tự")
    @Column(nullable = false, length = 250)
    private String title;

    @Size(max = 500, message = "Tóm tắt tối đa 500 ký tự")
    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image", columnDefinition = "LONGTEXT")
    private String image;

    @Column(length = 50)
    @Builder.Default
    private String category = "TIN_TUC";

    @Column(name = "category_label", length = 100)
    @Builder.Default
    private String categoryLabel = "Tin Tức";

    @Size(max = 100, message = "Tên tác giả tối đa 100 ký tự")
    @Column(length = 100)
    @Builder.Default
    private String author = "D2 Media";

    @Column(name = "read_time", length = 50)
    @Builder.Default
    private String readTime = "5 phút đọc";

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

