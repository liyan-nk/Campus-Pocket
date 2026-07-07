package com.campuspocket.dto;

import jakarta.validation.constraints.NotBlank;

public class PasswordChangeRequest {

    private String oldPassword; // Can be null if student is forced to change password (e.g. after activation/temp reset)

    @NotBlank(message = "New password is required")
    private String newPassword;

    public PasswordChangeRequest() {
    }

    public PasswordChangeRequest(String oldPassword, String newPassword) {
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
