package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.Map;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @com.fasterxml.jackson.annotation.JsonProperty("category")
    public void setCategoryFromJson(Object cat) {
        if (cat instanceof ProductCategory pc) {
            this.category = pc;
        } else if (cat instanceof String str) {
            this.category = ProductCategory.builder().code(str.toUpperCase()).name(str).build();
        } else if (cat instanceof Map<?, ?> map) {
            Object idVal = map.get("id");
            Long id = idVal instanceof Number n ? n.longValue() : null;
            String code = (String) map.get("code");
            String name = (String) map.get("name");
            this.category = ProductCategory.builder().id(id).code(code).name(name != null ? name : code).build();
        }
    }

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    @Builder.Default
    private ProductType productType = ProductType.RENTAL;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Column(name = "price_unit", nullable = false, length = 50)
    @Builder.Default
    private String priceUnit = "/ buoi choi";

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(length = 50)
    private String badge;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specs", columnDefinition = "json")
    private Map<String, Object> specs;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    public String getSpec1() {
        if (specs == null || specs.isEmpty()) return null;
        Iterator<Map.Entry<String, Object>> it = specs.entrySet().iterator();
        if (it.hasNext()) {
            Map.Entry<String, Object> entry = it.next();
            return entry.getKey() + ": " + entry.getValue();
        }
        return null;
    }

    @Transient
    public String getSpec2() {
        if (specs == null || specs.size() < 2) return null;
        Iterator<Map.Entry<String, Object>> it = specs.entrySet().iterator();
        it.next(); // skip first
        if (it.hasNext()) {
            Map.Entry<String, Object> entry = it.next();
            return entry.getKey() + ": " + entry.getValue();
        }
        return null;
    }

    @Transient
    public String getCategoryCode() {
        return category != null ? category.getCode() : null;
    }
}
