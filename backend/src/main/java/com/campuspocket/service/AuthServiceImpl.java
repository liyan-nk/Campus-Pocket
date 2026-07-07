package com.campuspocket.service;

import com.campuspocket.dto.*;
import com.campuspocket.model.Admin;
import com.campuspocket.model.Student;
import com.campuspocket.repository.AdminRepository;
import com.campuspocket.repository.StudentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(StudentRepository studentRepository, 
                           AdminRepository adminRepository, 
                           PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void activateStudent(StudentActivateRequest request) {
        Student student = studentRepository.findByRollNo(request.getRollNo().toUpperCase().trim())
            .orElseThrow(() -> new IllegalArgumentException("Invalid roll number. No record found."));

        if (student.isActivated()) {
            throw new IllegalStateException("Account is already activated. Please log in.");
        }

        // Normalize input activation code (uppercase and strip hyphens)
        String inputCode = request.getActivationCode();
        String normalizedCode = inputCode != null ? inputCode.trim().toUpperCase().replace("-", "") : "";

        // Verify activation code hash
        boolean codeMatches = passwordEncoder.matches(normalizedCode, student.getActivationCodeHash());
        if (!codeMatches) {
            throw new IllegalArgumentException("Invalid activation code.");
        }

        // Set password and update state
        student.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        student.setActivated(true);
        student.setMustChangePassword(false);
        student.setEnabled(true);

        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void changePassword(String username, String userRole, PasswordChangeRequest request) {
        if ("ROLE_STUDENT".equals(userRole)) {
            Student student = studentRepository.findByRollNo(username)
                .orElseThrow(() -> new IllegalArgumentException("Student record not found."));

            // Verify old password (required for student security, even if mustChangePassword is true, they entered with temp password)
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                throw new IllegalArgumentException("Current password is required.");
            }
            if (!passwordEncoder.matches(request.getOldPassword(), student.getPasswordHash())) {
                throw new IllegalArgumentException("Incorrect current password.");
            }

            student.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            student.setMustChangePassword(false);
            studentRepository.save(student);

        } else if ("ROLE_ADMIN".equals(userRole)) {
            Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Admin record not found."));

            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                throw new IllegalArgumentException("Current password is required.");
            }
            if (!passwordEncoder.matches(request.getOldPassword(), admin.getPasswordHash())) {
                throw new IllegalArgumentException("Incorrect current password.");
            }

            admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            adminRepository.save(admin);
        } else {
            throw new IllegalArgumentException("Invalid user role.");
        }
    }

    @Override
    public AuthStatusResponse getAuthStatus(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return new AuthStatusResponse(false, null, null, null, false);
        }

        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        boolean isStudent = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_STUDENT".equals(a.getAuthority()));
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (isStudent) {
            Optional<Student> studentOpt = studentRepository.findByRollNo(username);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                return new AuthStatusResponse(true, "STUDENT", student.getRollNo(), student.getName(), student.isMustChangePassword());
            }
        } else if (isAdmin) {
            Optional<Admin> adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                return new AuthStatusResponse(true, "ADMIN", admin.getUsername(), "Administrator", false);
            }
        }

        return new AuthStatusResponse(false, null, null, null, false);
    }
}
