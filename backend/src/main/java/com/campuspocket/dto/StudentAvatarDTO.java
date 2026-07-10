package com.campuspocket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StudentAvatarDTO {

    @NotBlank(message = "Avatar mode is required.")
    @Pattern(regexp = "INITIALS|IMAGE", message = "Avatar mode must be either INITIALS or IMAGE.")
    private String avatarMode;

    private String avatarInitials;

    private String avatarImage;

    public StudentAvatarDTO() {}

    public StudentAvatarDTO(String avatarMode, String avatarInitials, String avatarImage) {
        this.avatarMode = avatarMode;
        this.avatarInitials = avatarInitials;
        this.avatarImage = avatarImage;
    }

    public String getAvatarMode() {
        return avatarMode;
    }

    public void setAvatarMode(String avatarMode) {
        this.avatarMode = avatarMode;
    }

    public String getAvatarInitials() {
        return avatarInitials;
    }

    public void setAvatarInitials(String avatarInitials) {
        this.avatarInitials = avatarInitials;
    }

    public String getAvatarImage() {
        return avatarImage;
    }

    public void setAvatarImage(String avatarImage) {
        this.avatarImage = avatarImage;
    }
}
