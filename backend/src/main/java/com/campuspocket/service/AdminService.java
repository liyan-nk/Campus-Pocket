package com.campuspocket.service;

import com.campuspocket.dto.*;
import com.campuspocket.model.Timetable;

import java.util.List;

public interface AdminService {
    // Student Management
    StudentCreateResponse createStudent(StudentCreateRequest request);
    List<StudentAdminResponse> getAllStudents();
    List<StudentAdminResponse> searchStudents(String query);
    void toggleStudentStatus(String rollNo);
    PasswordResetResponse resetStudentPassword(String rollNo);
    void deleteStudent(String rollNo);

    // Timetable Management
    Timetable addTimetableEntry(TimetableRequest request);
    Timetable updateTimetableEntry(Long id, TimetableRequest request);
    void deleteTimetableEntry(Long id);
    List<Timetable> getAllTimetableEntries();
}
