package com.campuspocket.dto;

public class SubjectAttendanceStats {

    private String subject;
    private int present;
    private int absent;
    private int total;
    private double percentage;

    public SubjectAttendanceStats() {
    }

    public SubjectAttendanceStats(String subject, int present, int absent, int total, double percentage) {
        this.subject = subject;
        this.present = present;
        this.absent = absent;
        this.total = total;
        this.percentage = percentage;
    }

    // Getters and Setters
    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getPresent() {
        return present;
    }

    public void setPresent(int present) {
        this.present = present;
    }

    public int getAbsent() {
        return absent;
    }

    public void setAbsent(int absent) {
        this.absent = absent;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
