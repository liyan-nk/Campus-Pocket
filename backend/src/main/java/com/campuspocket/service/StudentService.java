package com.campuspocket.service;

import com.campuspocket.dto.StudentProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface StudentService {
    StudentProfileResponse getStudentProfile(String rollNo);
    String uploadAvatar(String rollNo, MultipartFile file);
    void deleteAvatar(String rollNo);
}
