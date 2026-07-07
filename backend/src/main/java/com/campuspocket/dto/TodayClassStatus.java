package com.campuspocket.dto;

import com.campuspocket.model.Timetable;

public class TodayClassStatus {

    private Timetable timetable;
    private String attendanceStatus; // "PRESENT", "ABSENT", or "UNMARKED"

    public TodayClassStatus() {
    }

    public TodayClassStatus(Timetable timetable, String attendanceStatus) {
        this.timetable = timetable;
        this.attendanceStatus = attendanceStatus;
    }

    // Getters and Setters
    public Timetable getTimetable() {
        return timetable;
    }

    public void setTimetable(Timetable timetable) {
        this.timetable = timetable;
    }

    public String getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(String attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }
}
