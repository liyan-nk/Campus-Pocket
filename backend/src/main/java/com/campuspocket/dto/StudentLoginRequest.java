package com.campuspocket.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentLoginRequest {

    @NotBlank(message = "Roll number is required")
    private String rollNo;

    @NotBlank(message = "Password is required")
    private String password;

    public StudentLoginRequest() {
    }

    public StudentLoginRequest(String rollNo, String password) {
        this.rollNo = rollNo;
        this.password = password;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
