package com.campuspocket.dto;

import java.util.List;

public class AttendanceSummaryResponse {

    private List<SubjectAttendanceStats> stats;
    private int totalClasses;
    private int totalPresent;
    private int totalAbsent;
    private double overallPercentage;

    public AttendanceSummaryResponse() {
    }

    public AttendanceSummaryResponse(List<SubjectAttendanceStats> stats, int totalClasses, int totalPresent, int totalAbsent, double overallPercentage) {
        this.stats = stats;
        this.totalClasses = totalClasses;
        this.totalPresent = totalPresent;
        this.totalAbsent = totalAbsent;
        this.overallPercentage = overallPercentage;
    }

    // Getters and Setters
    public List<SubjectAttendanceStats> getStats() {
        return stats;
    }

    public void setStats(List<SubjectAttendanceStats> stats) {
        this.stats = stats;
    }

    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public int getTotalPresent() {
        return totalPresent;
    }

    public void setTotalPresent(int totalPresent) {
        this.totalPresent = totalPresent;
    }

    public int getTotalAbsent() {
        return totalAbsent;
    }

    public void setTotalAbsent(int totalAbsent) {
        this.totalAbsent = totalAbsent;
    }

    public double getOverallPercentage() {
        return overallPercentage;
    }

    public void setOverallPercentage(double overallPercentage) {
        this.overallPercentage = overallPercentage;
    }
}
