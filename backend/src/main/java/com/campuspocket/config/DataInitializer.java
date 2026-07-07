package com.campuspocket.config;

import com.campuspocket.model.*;
import com.campuspocket.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final TimetableRepository timetableRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminRepository adminRepository,
                           StudentRepository studentRepository,
                           TimetableRepository timetableRepository,
                           TaskRepository taskRepository,
                           PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.timetableRepository = timetableRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Default Admin if none exists
        if (adminRepository.count() == 0) {
            String adminUsername = "admin";
            String adminPassword = "admin123";
            Admin defaultAdmin = new Admin(adminUsername, passwordEncoder.encode(adminPassword));
            adminRepository.save(defaultAdmin);
            System.out.println(">>> SEED: Default Admin created (username: 'admin', password: 'admin123')");
        }

        // 2. Seed Sample Student if none exists
        if (studentRepository.count() == 0) {
            // Activation code is "ACT8888", password is not set yet (null/empty until activated)
            // Storing hashed activation code
            String rawActivationCode = "ACT8888";
            String codeHash = passwordEncoder.encode(rawActivationCode);

            Student sampleStudent = new Student(
                "CS202601",
                "John Doe",
                "1234567890",
                "CSE",
                "S3",
                "A",
                null, // passwordHash is null before activation
                codeHash,
                false, // not activated yet
                false  // mustChangePassword is false initially
            );
            studentRepository.save(sampleStudent);
            System.out.println(">>> SEED: Pre-approved student record created (Roll: 'CS202601', Code: 'ACT8888')");
        }

        // 3. Seed Sample Timetable if none exists
        if (timetableRepository.count() == 0) {
            List<Timetable> sampleTimetable = List.of(
                new Timetable("CSE", "S3", "A", "Data Structures", "Prof. Smith", "Monday", 
                    LocalTime.of(9, 0), LocalTime.of(10, 0), "Room 101"),
                new Timetable("CSE", "S3", "A", "Java Programming", "Dr. Jones", "Monday", 
                    LocalTime.of(10, 15), LocalTime.of(11, 15), "Room 102"),
                new Timetable("CSE", "S3", "A", "Digital Electronics", "Prof. Alan", "Tuesday", 
                    LocalTime.of(9, 0), LocalTime.of(10, 0), "Room 103"),
                new Timetable("CSE", "S3", "A", "Discrete Mathematics", "Dr. Clara", "Wednesday", 
                    LocalTime.of(11, 30), LocalTime.of(12, 30), "Room 104")
            );
            timetableRepository.saveAll(sampleTimetable);
            System.out.println(">>> SEED: Sample CSE S3 A timetable seeded");
        }
    }
}
