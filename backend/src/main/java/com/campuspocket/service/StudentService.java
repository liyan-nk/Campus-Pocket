package com.campuspocket.service;

import com.campuspocket.dto.StudentProfileResponse;

public interface StudentService {
    StudentProfileResponse getStudentProfile(String rollNo);
}
