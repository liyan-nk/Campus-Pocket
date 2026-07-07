package com.campuspocket.dto;

public class StudentProfileResponse {

    private String rollNo;
    private String name;
    private String phone;
    private String department;
    private String semester;
    private String batch;

    public StudentProfileResponse() {
    }

    public StudentProfileResponse(String rollNo, String name, String phone, String department, String semester, String batch) {
        this.rollNo = rollNo;
        this.name = name;
        this.phone = phone;
        this.department = department;
        this.semester = semester;
        this.batch = batch;
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
}
