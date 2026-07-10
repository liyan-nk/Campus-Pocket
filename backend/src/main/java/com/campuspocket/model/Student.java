package com.campuspocket.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @Column(name = "roll_no")
    private String rollNo;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private String batch;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "activation_code_hash", nullable = false)
    private String activationCodeHash;

    @Column(nullable = false)
    private boolean activated;

    @Column(name = "must_change_password", nullable = false)
    private boolean mustChangePassword;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "avatar_mode")
    private String avatarMode = "INITIALS";

    @Column(name = "avatar_initials")
    private String avatarInitials;

    @Column(name = "avatar_image", columnDefinition = "TEXT")
    private String avatarImage;

    public Student() {
        this.enabled = true;
    }

    public Student(String rollNo, String name, String phone, String department, String semester, String batch, 
                   String passwordHash, String activationCodeHash, boolean activated, boolean mustChangePassword) {
        this.rollNo = rollNo;
        this.name = name;
        this.phone = phone;
        this.department = department;
        this.semester = semester;
        this.batch = batch;
        this.passwordHash = passwordHash;
        this.activationCodeHash = activationCodeHash;
        this.activated = activated;
        this.mustChangePassword = mustChangePassword;
        this.enabled = true;
        this.avatarMode = "INITIALS";
    }

    // Getters and Setters
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

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getActivationCodeHash() {
        return activationCodeHash;
    }

    public void setActivationCodeHash(String activationCodeHash) {
        this.activationCodeHash = activationCodeHash;
    }

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
