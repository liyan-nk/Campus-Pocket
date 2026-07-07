package com.campuspocket.service;

import com.campuspocket.dto.StudentProfileResponse;
import com.campuspocket.model.Student;
import com.campuspocket.repository.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public StudentProfileResponse getStudentProfile(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student record not found."));

        return new StudentProfileResponse(
            student.getRollNo(),
            student.getName(),
            student.getPhone(),
            student.getDepartment(),
            student.getSemester(),
            student.getBatch()
        );
    }
}
