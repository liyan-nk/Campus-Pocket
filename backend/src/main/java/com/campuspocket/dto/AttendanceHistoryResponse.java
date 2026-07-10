package com.campuspocket.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceHistoryResponse {

    private LocalDate date;
    private String subjectName;
    private String subjectCode;
    private LocalTime startTime;
    private String status;

    public AttendanceHistoryResponse() {
    }

    public AttendanceHistoryResponse(LocalDate date, String subjectName, String subjectCode, LocalTime startTime, String status) {
        this.date = date;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.startTime = startTime;
        this.status = status;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
