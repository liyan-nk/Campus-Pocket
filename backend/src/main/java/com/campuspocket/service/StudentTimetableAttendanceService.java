package com.campuspocket.service;

import com.campuspocket.dto.*;
import com.campuspocket.model.Timetable;

import java.util.List;

public interface StudentTimetableAttendanceService {
    List<Timetable> getStudentTimetable(String rollNo);
    void markAttendance(String rollNo, AttendanceMarkRequest request);
    AttendanceSummaryResponse getAttendanceSummary(String rollNo);
    StudentDashboardResponse getStudentDashboard(String rollNo, java.time.LocalDate todayDate, java.time.LocalTime nowTime);
}
