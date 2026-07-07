package com.campuspocket.service;

import com.campuspocket.dto.*;
import org.springframework.security.core.Authentication;

public interface AuthService {
    void activateStudent(StudentActivateRequest request);
    void changePassword(String username, String userRole, PasswordChangeRequest request);
    AuthStatusResponse getAuthStatus(Authentication authentication);
}
