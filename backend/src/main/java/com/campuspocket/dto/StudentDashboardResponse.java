package com.campuspocket.dto;

import java.time.LocalDate;
import java.util.List;

public class StudentDashboardResponse {

    private String studentName;
    private String department;
    private String semester;
    private String batch;
    private LocalDate date;
    private TodayClassStatus nextClass;
    private List<TodayClassStatus> todayClasses;
    private int pendingTasksCount;

    public StudentDashboardResponse() {
    }

    public StudentDashboardResponse(String studentName, String department, String semester, String batch, 
                                    LocalDate date, TodayClassStatus nextClass, List<TodayClassStatus> todayClasses,
                                    int pendingTasksCount) {
        this.studentName = studentName;
        this.department = department;
        this.semester = semester;
        this.batch = batch;
        this.date = date;
        this.nextClass = nextClass;
        this.todayClasses = todayClasses;
        this.pendingTasksCount = pendingTasksCount;
    }

    // Getters and Setters
    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public TodayClassStatus getNextClass() {
        return nextClass;
    }

    public void setNextClass(TodayClassStatus nextClass) {
        this.nextClass = nextClass;
    }

    public List<TodayClassStatus> getTodayClasses() {
        return todayClasses;
    }

    public void setTodayClasses(List<TodayClassStatus> todayClasses) {
        this.todayClasses = todayClasses;
    }

    public int getPendingTasksCount() {
        return pendingTasksCount;
    }

    public void setPendingTasksCount(int pendingTasksCount) {
        this.pendingTasksCount = pendingTasksCount;
    }
}
