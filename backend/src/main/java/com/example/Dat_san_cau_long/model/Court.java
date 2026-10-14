package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courts")
public class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 50)
    private String name; // Sân 1, Sân 2, ...

    private Integer courtNumber; // 1, 2, 3...

    @Column(length = 50)
    private String courtGroup; // Sân 1+2, Sân 3+4, Sân 5+6, Sân 7

    private Boolean active = true;

    public Court() {
    }

    public Court(Long id, Branch branch, String name, Integer courtNumber, String courtGroup, Boolean active) {
        this.id = id;
        this.branch = branch;
        this.name = name;
        this.courtNumber = courtNumber;
        this.courtGroup = courtGroup;
        this.active = active != null ? active : true;
    }

    public static CourtBuilder builder() {
        return new CourtBuilder();
    }

    public static class CourtBuilder {
        private Long id;
        private Branch branch;
        private String name;
        private Integer courtNumber;
        private String courtGroup;
        private Boolean active = true;

        public CourtBuilder id(Long id) { this.id = id; return this; }
        public CourtBuilder branch(Branch branch) { this.branch = branch; return this; }
        public CourtBuilder name(String name) { this.name = name; return this; }
        public CourtBuilder courtNumber(Integer courtNumber) { this.courtNumber = courtNumber; return this; }
        public CourtBuilder courtGroup(String courtGroup) { this.courtGroup = courtGroup; return this; }
        public CourtBuilder active(Boolean active) { this.active = active; return this; }

        public Court build() {
            return new Court(id, branch, name, courtNumber, courtGroup, active);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCourtNumber() { return courtNumber; }
    public void setCourtNumber(Integer courtNumber) { this.courtNumber = courtNumber; }

    public String getCourtGroup() { return courtGroup; }
    public void setCourtGroup(String courtGroup) { this.courtGroup = courtGroup; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
