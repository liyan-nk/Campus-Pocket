package com.campuspocket.controller;

import com.campuspocket.dto.*;
import com.campuspocket.model.Student;
import com.campuspocket.repository.StudentRepository;
import com.campuspocket.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final StudentRepository studentRepository;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService authService, 
                          StudentRepository studentRepository, 
                          AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.studentRepository = studentRepository;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/student/activate")
    public ResponseEntity<?> activateStudent(@Valid @RequestBody StudentActivateRequest request) {
        try {
            authService.activateStudent(request);
            return ResponseEntity.ok(Map.of("message", "Account activated successfully. You can now log in."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@Valid @RequestBody StudentLoginRequest request, HttpServletRequest httpRequest) {
        // Enforce validations: Account exists, activated, enabled
        Student student = studentRepository.findByRollNo(request.getRollNo())
            .orElse(null);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect Roll Number or password."));
        }

        if (!student.isActivated()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Account is not activated yet. Please activate first."));
        }

        if (!student.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Account has been disabled. Please contact administrator."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getRollNo(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
            
            AuthStatusResponse status = new AuthStatusResponse(true, "STUDENT", student.getRollNo(), student.getName(), student.isMustChangePassword());
            return ResponseEntity.ok(status);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect Roll Number or password."));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody AdminLoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
            
            AuthStatusResponse status = new AuthStatusResponse(true, "ADMIN", request.getUsername(), "Administrator", false);
            return ResponseEntity.ok(status);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect username or password."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        String username = authentication.getName();
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        try {
            authService.changePassword(username, role, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<AuthStatusResponse> getStatus(Authentication authentication) {
        return ResponseEntity.ok(authService.getAuthStatus(authentication));
    }
}
