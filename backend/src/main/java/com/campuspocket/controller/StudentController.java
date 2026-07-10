package com.campuspocket.controller;

import com.campuspocket.dto.*;
import com.campuspocket.model.Timetable;
import com.campuspocket.service.StudentService;
import com.campuspocket.service.StudentTimetableAttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;
    private final StudentTimetableAttendanceService studentTimetableAttendanceService;

    public StudentController(StudentService studentService, 
                             StudentTimetableAttendanceService studentTimetableAttendanceService) {
        this.studentService = studentService;
        this.studentTimetableAttendanceService = studentTimetableAttendanceService;
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getProfile(Authentication authentication) {
        String rollNo = authentication.getName();
        return ResponseEntity.ok(studentService.getStudentProfile(rollNo));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardResponse> getDashboard(
            @RequestParam(value = "date", required = false) String dateStr,
            @RequestParam(value = "time", required = false) String timeStr,
            Authentication authentication) {
        String rollNo = authentication.getName();
        java.time.LocalDate localDate = (dateStr != null && !dateStr.isBlank()) 
            ? java.time.LocalDate.parse(dateStr) 
            : java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        java.time.LocalTime localTime = (timeStr != null && !timeStr.isBlank())
            ? java.time.LocalTime.parse(timeStr)
            : java.time.LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"));
        return ResponseEntity.ok(studentTimetableAttendanceService.getStudentDashboard(rollNo, localDate, localTime));
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Timetable>> getTimetable(Authentication authentication) {
        String rollNo = authentication.getName();
        return ResponseEntity.ok(studentTimetableAttendanceService.getStudentTimetable(rollNo));
    }

    @GetMapping("/attendance/summary")
    public ResponseEntity<AttendanceSummaryResponse> getAttendanceSummary(Authentication authentication) {
        String rollNo = authentication.getName();
        return ResponseEntity.ok(studentTimetableAttendanceService.getAttendanceSummary(rollNo));
    }

    @GetMapping("/attendance/dates")
    public ResponseEntity<List<String>> getAttendanceDates(Authentication authentication) {
        String rollNo = authentication.getName();
        return ResponseEntity.ok(studentTimetableAttendanceService.getAttendanceDates(rollNo));
    }

    @GetMapping("/attendance/history")
    public ResponseEntity<List<AttendanceHistoryResponse>> getAttendanceHistoryByDate(
            @RequestParam("date") String dateString,
            Authentication authentication) {
        String rollNo = authentication.getName();
        java.time.LocalDate date = java.time.LocalDate.parse(dateString);
        return ResponseEntity.ok(studentTimetableAttendanceService.getAttendanceHistoryByDate(rollNo, date));
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<?> markAttendance(@Valid @RequestBody AttendanceMarkRequest request, Authentication authentication) {
        String rollNo = authentication.getName();
        try {
            studentTimetableAttendanceService.markAttendance(rollNo, request);
            return ResponseEntity.ok(Map.of("message", "Attendance status updated."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
