package com.campuspocket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AttendanceMarkRequest {

    @NotNull(message = "Timetable ID is required")
    private Long timetableId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Status is required (PRESENT or ABSENT)")
    private String status;

    public AttendanceMarkRequest() {
    }

    public AttendanceMarkRequest(Long timetableId, LocalDate date, String status) {
        this.timetableId = timetableId;
        this.date = date;
        this.status = status;
    }

    // Getters and Setters
    public Long getTimetableId() {
        return timetableId;
    }

    public void setTimetableId(Long timetableId) {
        this.timetableId = timetableId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
