package com.campuspocket.service;

import com.campuspocket.dto.*;
import com.campuspocket.model.*;
import com.campuspocket.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final StudentRepository studentRepository;
    private final TimetableRepository timetableRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceRepository attendanceRepository;
    private final TaskRepository taskRepository;

    public AdminServiceImpl(StudentRepository studentRepository, 
                            TimetableRepository timetableRepository, 
                            PasswordEncoder passwordEncoder,
                            AttendanceRepository attendanceRepository,
                            TaskRepository taskRepository) {
        this.studentRepository = studentRepository;
        this.timetableRepository = timetableRepository;
        this.passwordEncoder = passwordEncoder;
        this.attendanceRepository = attendanceRepository;
        this.taskRepository = taskRepository;
    }

    // STUDENT MANAGEMENT

    @Override
    @Transactional
    public StudentCreateResponse createStudent(StudentCreateRequest request) {
        if (studentRepository.findByRollNo(request.getRollNo()).isPresent()) {
            throw new IllegalArgumentException("Student with this roll number already exists.");
        }

        String rawActivationCode = generateRandomCode("ACT");
        String codeHash = passwordEncoder.encode(rawActivationCode);

        Student student = new Student(
            request.getRollNo().toUpperCase().trim(),
            request.getName().trim(),
            request.getPhone().trim(),
            request.getDepartment().trim(),
            request.getSemester().trim(),
            request.getBatch().trim(),
            null, // passwordHash is empty initially
            codeHash,
            false, // activated = false
            false  // mustChangePassword = false initially
        );

        studentRepository.save(student);
        return new StudentCreateResponse(student.getRollNo(), student.getName(), rawActivationCode);
    }

    @Override
    public List<StudentAdminResponse> getAllStudents() {
        return studentRepository.findAll().stream()
            .map(this::mapToAdminResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<StudentAdminResponse> searchStudents(String query) {
        if (query == null || query.isBlank()) {
            return getAllStudents();
        }
        String cleanQuery = query.trim();
        return studentRepository.findByRollNoContainingIgnoreCaseOrNameContainingIgnoreCase(cleanQuery, cleanQuery).stream()
            .map(this::mapToAdminResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleStudentStatus(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));
        student.setEnabled(!student.isEnabled());
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public PasswordResetResponse resetStudentPassword(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        String rawTempPassword = generateRandomCode("TEMP");
        student.setPasswordHash(passwordEncoder.encode(rawTempPassword));
        student.setMustChangePassword(true);
        
        // Force account enabled in case it was disabled
        student.setEnabled(true);

        studentRepository.save(student);
        return new PasswordResetResponse(student.getRollNo(), rawTempPassword);
    }

    @Override
    @Transactional
    public void deleteStudent(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        // Cascade delete child entities
        taskRepository.deleteByStudentRollNo(rollNo);
        attendanceRepository.deleteByStudentRollNo(rollNo);

        studentRepository.delete(student);
    }

    // TIMETABLE MANAGEMENT

    @Override
    @Transactional
    public Timetable addTimetableEntry(TimetableRequest request) {
        Timetable entry = new Timetable(
            request.getDepartment().trim(),
            request.getSemester().trim(),
            request.getBatch().trim(),
            request.getSubject().trim(),
            request.getFaculty().trim(),
            request.getDay().trim(),
            request.getStartTime(),
            request.getEndTime(),
            request.getRoom().trim()
        );
        return timetableRepository.save(entry);
    }

    @Override
    @Transactional
    public Timetable updateTimetableEntry(Long id, TimetableRequest request) {
        Timetable entry = timetableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Timetable entry not found."));

        entry.setDepartment(request.getDepartment().trim());
        entry.setSemester(request.getSemester().trim());
        entry.setBatch(request.getBatch().trim());
        entry.setSubject(request.getSubject().trim());
        entry.setFaculty(request.getFaculty().trim());
        entry.setDay(request.getDay().trim());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setRoom(request.getRoom().trim());

        return timetableRepository.save(entry);
    }

    @Override
    @Transactional
    public void deleteTimetableEntry(Long id) {
        if (!timetableRepository.existsById(id)) {
            throw new IllegalArgumentException("Timetable entry not found.");
        }
        timetableRepository.deleteById(id);
    }

    @Override
    public List<Timetable> getAllTimetableEntries() {
        return timetableRepository.findAll();
    }

    // HELPERS

    private StudentAdminResponse mapToAdminResponse(Student s) {
        return new StudentAdminResponse(
            s.getRollNo(),
            s.getName(),
            s.getPhone(),
            s.getDepartment(),
            s.getSemester(),
            s.getBatch(),
            s.isActivated(),
            s.isMustChangePassword(),
            s.isEnabled()
        );
    }

    private String generateRandomCode(String prefix) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(prefix);
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
