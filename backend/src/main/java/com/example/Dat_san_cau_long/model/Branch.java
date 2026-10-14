package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;

@Entity
@Table(name = "branches")
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // NVL, DQII, NQA, HB

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(length = 20)
    private String phone;

    private Integer totalCourts;

    public Branch() {
    }

    public Branch(Long id, String code, String name, String address, String phone, Integer totalCourts) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.totalCourts = totalCourts;
    }

    public static BranchBuilder builder() {
        return new BranchBuilder();
    }

    public static class BranchBuilder {
        private Long id;
        private String code;
        private String name;
        private String address;
        private String phone;
        private Integer totalCourts;

        public BranchBuilder id(Long id) { this.id = id; return this; }
        public BranchBuilder code(String code) { this.code = code; return this; }
        public BranchBuilder name(String name) { this.name = name; return this; }
        public BranchBuilder address(String address) { this.address = address; return this; }
        public BranchBuilder phone(String phone) { this.phone = phone; return this; }
        public BranchBuilder totalCourts(Integer totalCourts) { this.totalCourts = totalCourts; return this; }

        public Branch build() {
            return new Branch(id, code, name, address, phone, totalCourts);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Integer getTotalCourts() { return totalCourts; }
    public void setTotalCourts(Integer totalCourts) { this.totalCourts = totalCourts; }
}
