package com.campuspocket.dto;

public class PasswordResetResponse {

    private String rollNo;
    private String temporaryPassword;

    public PasswordResetResponse() {
    }

    public PasswordResetResponse(String rollNo, String temporaryPassword) {
        this.rollNo = rollNo;
        this.temporaryPassword = temporaryPassword;
    }

    // Getters and Setters
    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}
