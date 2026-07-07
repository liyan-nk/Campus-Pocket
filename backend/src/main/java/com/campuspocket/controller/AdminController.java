package com.campuspocket.controller;

import com.campuspocket.dto.*;
import com.campuspocket.model.Timetable;
import com.campuspocket.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // STUDENT MANAGEMENT ENDPOINTS

    @PostMapping("/students")
    public ResponseEntity<StudentCreateResponse> createStudent(@Valid @RequestBody StudentCreateRequest request) {
        return ResponseEntity.ok(adminService.createStudent(request));
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentAdminResponse>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/students/search")
    public ResponseEntity<List<StudentAdminResponse>> searchStudents(@RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(adminService.searchStudents(query));
    }

    @PostMapping("/students/{rollNo}/toggle-status")
    public ResponseEntity<?> toggleStudentStatus(@PathVariable("rollNo") String rollNo) {
        try {
            adminService.toggleStudentStatus(rollNo);
            return ResponseEntity.ok(Map.of("message", "Student status updated successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/students/{rollNo}/reset-password")
    public ResponseEntity<?> resetStudentPassword(@PathVariable("rollNo") String rollNo) {
        try {
            PasswordResetResponse response = adminService.resetStudentPassword(rollNo);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/students/{rollNo}")
    public ResponseEntity<?> deleteStudent(@PathVariable("rollNo") String rollNo) {
        try {
            adminService.deleteStudent(rollNo);
            return ResponseEntity.ok(Map.of("message", "Student and associated records deleted."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // TIMETABLE MANAGEMENT ENDPOINTS

    @PostMapping("/timetable")
    public ResponseEntity<Timetable> addTimetableEntry(@Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.ok(adminService.addTimetableEntry(request));
    }

    @PutMapping("/timetable/{id}")
    public ResponseEntity<?> updateTimetableEntry(@PathVariable("id") Long id, @Valid @RequestBody TimetableRequest request) {
        try {
            Timetable entry = adminService.updateTimetableEntry(id, request);
            return ResponseEntity.ok(entry);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/timetable/{id}")
    public ResponseEntity<?> deleteTimetableEntry(@PathVariable("id") Long id) {
        try {
            adminService.deleteTimetableEntry(id);
            return ResponseEntity.ok(Map.of("message", "Timetable entry deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Timetable>> getAllTimetableEntries() {
        return ResponseEntity.ok(adminService.getAllTimetableEntries());
    }
}
