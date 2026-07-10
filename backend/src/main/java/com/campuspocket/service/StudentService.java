package com.campuspocket.service;

import com.campuspocket.dto.StudentProfileResponse;
import com.campuspocket.dto.StudentAvatarDTO;

public interface StudentService {
    StudentProfileResponse getStudentProfile(String rollNo);
    StudentAvatarDTO getStudentAvatar(String rollNo);
    void updateStudentAvatar(String rollNo, StudentAvatarDTO dto);
}
