package com.campuspocket.dto;

public class StudentCreateResponse {

    private String rollNo;
    private String name;
    private String activationCode;

    public StudentCreateResponse() {
    }

    public StudentCreateResponse(String rollNo, String name, String activationCode) {
        this.rollNo = rollNo;
        this.name = name;
        this.activationCode = activationCode;
    }

    // Getters and Setters
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

    public String getActivationCode() {
        return activationCode;
    }

    public void setActivationCode(String activationCode) {
        this.activationCode = activationCode;
    }
}
