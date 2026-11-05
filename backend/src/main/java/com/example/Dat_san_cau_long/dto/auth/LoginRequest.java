package com.example.Dat_san_cau_long.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;

public class LoginRequest {
    @JsonAlias({"username", "account", "login"})
    private String identifier; // username / phone / email
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String identifier, String password) {
        this.identifier = identifier;
        this.password = password;
    }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public void setUsername(String username) {
        if (this.identifier == null || this.identifier.trim().isEmpty()) {
            this.identifier = username;
        }
    }
    public String getUsername() { return identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
