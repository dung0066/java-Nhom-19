package com.example.Dat_san_cau_long.dto.auth;

public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private String phone;
    private String avatar;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String email, String phone, String avatar) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
