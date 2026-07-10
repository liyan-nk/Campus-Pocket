package com.campuspocket.service;

import com.campuspocket.dto.StudentProfileResponse;
import com.campuspocket.model.Student;
import com.campuspocket.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StorageService storageService;

    public StudentServiceImpl(StudentRepository studentRepository, StorageService storageService) {
        this.studentRepository = studentRepository;
        this.storageService = storageService;
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

    @Override
    public String uploadAvatar(String rollNo, MultipartFile file) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student record not found."));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file.");
        }

        // Validate File Size (Maximum 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Upload size limit exceeded. Max 2MB allowed.");
        }

        // Validate MIME type (Only jpeg, png, webp)
        String contentType = file.getContentType();
        if (contentType == null || 
            (!contentType.equalsIgnoreCase("image/jpeg") && 
             !contentType.equalsIgnoreCase("image/png") && 
             !contentType.equalsIgnoreCase("image/webp"))) {
            throw new IllegalArgumentException("Unsupported image format. Only JPEG, PNG, and WEBP are allowed.");
        }

        try {
            byte[] fileBytes = file.getBytes();
            // Upload to Storage provider (Supabase/Local fallback)
            String rawUrl = storageService.uploadProfileImage(rollNo, fileBytes, contentType);
            
            // Append cache busting version timestamp
            String versionedUrl = rawUrl + "?v=" + System.currentTimeMillis();
            student.setAvatarUrl(versionedUrl);
            studentRepository.save(student);
            
            return versionedUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read upload stream: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteAvatar(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student record not found."));

        storageService.deleteProfileImage(rollNo);
        student.setAvatarUrl(null);
        studentRepository.save(student);
    }
}
