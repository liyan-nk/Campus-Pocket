package com.campuspocket.dto;

public class AuthStatusResponse {

    private boolean authenticated;
    private String role;
    private String username;
    private String name;
    private boolean mustChangePassword;
    private String avatarUrl;

    public AuthStatusResponse() {
    }

    public AuthStatusResponse(boolean authenticated, String role, String username, String name, boolean mustChangePassword, String avatarUrl) {
        this.authenticated = authenticated;
        this.role = role;
        this.username = username;
        this.name = name;
        this.mustChangePassword = mustChangePassword;
        this.avatarUrl = avatarUrl;
    }

    // Getters and Setters
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
