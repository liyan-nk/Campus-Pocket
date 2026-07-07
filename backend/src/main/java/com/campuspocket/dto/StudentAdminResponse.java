package com.campuspocket.dto;

public class StudentAdminResponse {

    private String rollNo;
    private String name;
    private String phone;
    private String department;
    private String semester;
    private String batch;
    private boolean activated;
    private boolean mustChangePassword;
    private boolean enabled;

    public StudentAdminResponse() {
    }

    public StudentAdminResponse(String rollNo, String name, String phone, String department, String semester, String batch, 
                                boolean activated, boolean mustChangePassword, boolean enabled) {
        this.rollNo = rollNo;
        this.name = name;
        this.phone = phone;
        this.department = department;
        this.semester = semester;
        this.batch = batch;
        this.activated = activated;
        this.mustChangePassword = mustChangePassword;
        this.enabled = enabled;
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
