package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.ProductType;
import jakarta.persistence.*;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.constraints.*;
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

    @NotBlank(groups = OnCreate.class, message = "Tên sản phẩm không được để trống")
    @Size(max = 150, message = "Tên sản phẩm tối đa 150 ký tự")
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 100, message = "Thương hiệu tối đa 100 ký tự")
    @Column(length = 100)
    private String brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    @Builder.Default
    private ProductType productType = ProductType.RENTAL;

    @NotNull(groups = OnCreate.class, message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0", message = "Giá sản phẩm không được âm")
    @DecimalMax(value = "100000000", message = "Giá sản phẩm tối đa 100.000.000đ")
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Size(max = 50, message = "Đơn vị tính tối đa 50 ký tự")
    @Column(name = "price_unit", nullable = false, length = 50)
    @Builder.Default
    private String priceUnit = "/ buoi choi";

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Size(max = 50, message = "Nhãn tối đa 50 ký tự")
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
