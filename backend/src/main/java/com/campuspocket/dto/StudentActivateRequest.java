package com.campuspocket.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentActivateRequest {

    @NotBlank(message = "Roll number is required")
    private String rollNo;

    @NotBlank(message = "Activation code is required")
    private String activationCode;

    @NotBlank(message = "Password is required")
    private String password;

    public StudentActivateRequest() {
    }

    public StudentActivateRequest(String rollNo, String activationCode, String password) {
        this.rollNo = rollNo;
        this.activationCode = activationCode;
        this.password = password;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
