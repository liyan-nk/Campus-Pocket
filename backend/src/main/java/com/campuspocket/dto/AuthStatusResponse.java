package com.campuspocket.dto;

public class AuthStatusResponse {

    private boolean authenticated;
    private String role;
    private String username;
    private String name;
    private boolean mustChangePassword;

    public AuthStatusResponse() {
    }

    public AuthStatusResponse(boolean authenticated, String role, String username, String name, boolean mustChangePassword) {
        this.authenticated = authenticated;
        this.role = role;
        this.username = username;
        this.name = name;
        this.mustChangePassword = mustChangePassword;
    }

    // Getters and Setters
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
