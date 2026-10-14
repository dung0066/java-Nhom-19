package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // RACQUET, SHOES, ACCESSORY

    private String brand;

    @Column(nullable = false)
    private Double price;

    private String priceUnit; // / buổi chơi, / ống 12 quả, / món

    @Column(length = 1000)
    private String imageUrl;

    private String badge; // HOT NHẤT, VIP, BÁN CHẠY...

    private String spec1; // Trọng lượng: 4U/G5

    private String spec2; // Lực căng: 11.0 kg

    @Column(length = 1000)
    private String description;

    private Boolean active = true;

    public Product() {
    }

    public Product(Long id, String name, String category, String brand, Double price, String priceUnit, String imageUrl, String badge, String spec1, String spec2, String description, Boolean active) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.price = price;
        this.priceUnit = priceUnit;
        this.imageUrl = imageUrl;
        this.badge = badge;
        this.spec1 = spec1;
        this.spec2 = spec2;
        this.description = description;
        this.active = active != null ? active : true;
    }

    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Long id;
        private String name;
        private String category;
        private String brand;
        private Double price;
        private String priceUnit;
        private String imageUrl;
        private String badge;
        private String spec1;
        private String spec2;
        private String description;
        private Boolean active = true;

        public ProductBuilder id(Long id) { this.id = id; return this; }
        public ProductBuilder name(String name) { this.name = name; return this; }
        public ProductBuilder category(String category) { this.category = category; return this; }
        public ProductBuilder brand(String brand) { this.brand = brand; return this; }
        public ProductBuilder price(Double price) { this.price = price; return this; }
        public ProductBuilder priceUnit(String priceUnit) { this.priceUnit = priceUnit; return this; }
        public ProductBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ProductBuilder badge(String badge) { this.badge = badge; return this; }
        public ProductBuilder spec1(String spec1) { this.spec1 = spec1; return this; }
        public ProductBuilder spec2(String spec2) { this.spec2 = spec2; return this; }
        public ProductBuilder description(String description) { this.description = description; return this; }
        public ProductBuilder active(Boolean active) { this.active = active; return this; }

        public Product build() {
            return new Product(id, name, category, brand, price, priceUnit, imageUrl, badge, spec1, spec2, description, active);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getSpec1() { return spec1; }
    public void setSpec1(String spec1) { this.spec1 = spec1; }

    public String getSpec2() { return spec2; }
    public void setSpec2(String spec2) { this.spec2 = spec2; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
