package com.campuspocket.config;

import com.campuspocket.model.*;
import com.campuspocket.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
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
            String rawActivationCode = "ACT8888";
            String codeHash = passwordEncoder.encode(rawActivationCode);

            Student sampleStudent = new Student(
                "CS202601",
                "John Doe",
                "1234567890",
                "CSE",
                "S3",
                "A",
                null, 
                codeHash,
                false, 
                false  
            );
            studentRepository.save(sampleStudent);
            System.out.println(">>> SEED: Pre-approved student record created (Roll: 'CS202601', Code: 'ACT8888')");
        }

        // Remove legacy/demo timetable entries if any exist
        List<Timetable> currentEntries = timetableRepository.findAll();
        boolean hasDemo = currentEntries.stream().anyMatch(t -> 
            "Prof. Smith".equals(t.getFaculty()) || 
            "Dr. Jones".equals(t.getFaculty()) || 
            "Prof. Alan".equals(t.getFaculty()) || 
            "Dr. Clara".equals(t.getFaculty()) ||
            t.getSubjectCode() == null
        );
        if (hasDemo) {
            timetableRepository.deleteAll();
            System.out.println(">>> SEED: Cleaned legacy demo timetable entries.");
        }

        // 3. Seed Real KMCT S3 CSE & AI&DS Timetable if empty
        if (timetableRepository.count() == 0) {
            List<Timetable> kmctTimetable = new ArrayList<>();

            // -------------------- S3 CSE TIMETABLE --------------------
            // Monday
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PBCST304", "Object Oriented Programming", "CASD", "Sonima Das CK", 1, "Monday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 2, "Monday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST302", "Theory of Computation", "CSNJ", "Najla Musthafa", 3, "Monday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 4, "Monday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 5, "Monday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 6, "Monday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST302", "Theory of Computation (Minor)", "CSNJ", "Najla Musthafa", 7, "Monday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 1"));

            // Tuesday
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 1, "Tuesday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 2, "Tuesday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 1"));
            // Tuesday Lab (Period 3-4 Continuous)
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCSL307 / PCCSL308", "Data Structures Lab / OOP Lab", "CSLL / CASD", "Laila V / Sonima Das CK", 3, "Tuesday", LocalTime.of(10, 50), LocalTime.of(12, 30), "CSE Lab 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "HUT347", "Engineering Ethics and Sustainable Development", "MSND", "Nandana K", 5, "Tuesday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PBCST304", "Object Oriented Programming", "CASD", "Sonima Das CK", 6, "Tuesday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PBCST304", "Object Oriented Programming", "CASD", "Sonima Das CK", 7, "Tuesday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 1"));

            // Wednesday
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 1, "Wednesday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST302", "Theory of Computation", "CSNJ", "Najla Musthafa", 2, "Wednesday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 1"));
            // Wednesday Lab (Period 3-4 Continuous)
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCSL308 / PCCSL307", "OOP Lab / Data Structures Lab", "CASD / CSLL", "Sonima Das CK / Laila V", 3, "Wednesday", LocalTime.of(10, 50), LocalTime.of(12, 30), "CSE Lab 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "HUT347", "Engineering Ethics and Sustainable Development", "MSND", "Nandana K", 5, "Wednesday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PBCST304", "Object Oriented Programming", "CASD", "Sonima Das CK", 6, "Wednesday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PBCST304", "Object Oriented Programming", "CASD", "Sonima Das CK", 7, "Wednesday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 1"));

            // Thursday
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 1, "Thursday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 2, "Thursday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST302", "Theory of Computation", "CSNJ", "Najla Musthafa", 3, "Thursday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 4, "Thursday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST302", "Theory of Computation", "CSNJ", "Najla Musthafa", 5, "Thursday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "HUT347", "Engineering Ethics and Sustainable Development", "MSND", "Nandana K", 6, "Thursday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PBCST304", "Object Oriented Programming", "CASD", "Sonima Das CK", 7, "Thursday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 1"));

            // Friday
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 1, "Friday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 2, "Friday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "HUT347", "Engineering Ethics and Sustainable Development", "SHSS", "Shamsudheen V", 3, "Friday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 4, "Friday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 5, "Friday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "PCCST302", "Theory of Computation", "CSNJ", "Najla Musthafa", 6, "Friday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 1"));
            kmctTimetable.add(new Timetable("CSE", "S3", "A", "GAEST305", "Digital Electronics & Logic Design (Minor)", "ECJS", "Jaseena T", 7, "Friday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 1"));


            // -------------------- S3 AI&DS TIMETABLE --------------------
            // Monday
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 1, "Monday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "GAEST305", "Digital Electronics & Logic Design (Minor)", "ECJS", "Jaseena T", 2, "Monday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PBADT304", "Introduction to Data Science", "CSST", "Sruthi TM", 3, "Monday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 4, "Monday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PBADT304", "Introduction to Data Science", "CSST", "Sruthi TM", 5, "Monday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "HUT347", "Engineering Ethics and Sustainable Development", "MSND", "Nandana K", 6, "Monday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 7, "Monday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 2"));

            // Tuesday
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCAIT302", "Foundations of Artificial Intelligence", "CASD", "Sonima Das CK", 1, "Tuesday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 2, "Tuesday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 3, "Tuesday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "MAT301", "Mathematics for Information Science (Minor)", "SHHM", "Hasna Musthafa", 4, "Tuesday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 5, "Tuesday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 6, "Tuesday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PBADT304", "Introduction to Data Science", "CSST", "Sruthi TM", 7, "Tuesday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 2"));

            // Wednesday
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 1, "Wednesday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 2, "Wednesday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 2"));
            // Wednesday Lab (Period 3-4 Continuous)
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCSL307", "Data Structures Lab", "CSST / CSSR", "Sruthi TM / CSSR", 3, "Wednesday", LocalTime.of(10, 50), LocalTime.of(12, 30), "AIDS Lab 1"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 5, "Wednesday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "GAEST305", "Digital Electronics & Logic Design", "ECJS", "Jaseena T", 6, "Wednesday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCAIT302", "Foundations of Artificial Intelligence", "CASD", "Sonima Das CK", 7, "Wednesday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 2"));

            // Thursday
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCAIT302", "Foundations of Artificial Intelligence", "CASD", "Sonima Das CK", 1, "Thursday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 2, "Thursday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCAIT302", "Foundations of Artificial Intelligence", "CASD", "Sonima Das CK", 3, "Thursday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 4, "Thursday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 2"));
            // Thursday Lab (Period 5-6 Continuous)
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCDL308", "Python and Statistical Modelling Lab", "CSNJ / CSSR", "Najla Musthafa / CSSR", 5, "Thursday", LocalTime.of(13, 20), LocalTime.of(15, 0), "AIDS Lab 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PBADT304", "Introduction to Data Science", "CSST", "Sruthi TM", 7, "Thursday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 2"));

            // Friday
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCAIT302", "Foundations of Artificial Intelligence", "CASD", "Sonima Das CK", 1, "Friday", LocalTime.of(9, 0), LocalTime.of(9, 50), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCCST303", "Data Structures and Algorithms", "CSLL", "Laila V", 2, "Friday", LocalTime.of(9, 50), LocalTime.of(10, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "MAT301", "Mathematics for Information Science", "SHHM", "Hasna Musthafa", 3, "Friday", LocalTime.of(10, 50), LocalTime.of(11, 40), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "HUT347", "Engineering Ethics and Sustainable Development", "MSND", "Nandana K", 4, "Friday", LocalTime.of(11, 40), LocalTime.of(12, 30), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PBADT304", "Introduction to Data Science", "CSST", "Sruthi TM", 5, "Friday", LocalTime.of(13, 20), LocalTime.of(14, 10), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PBADT304", "Introduction to Data Science", "CSST", "Sruthi TM", 6, "Friday", LocalTime.of(14, 10), LocalTime.of(15, 0), "LH 2"));
            kmctTimetable.add(new Timetable("AI&DS", "S3", "A", "PCAIT302", "Foundations of Artificial Intelligence (Minor)", "CASD", "Sonima Das CK", 7, "Friday", LocalTime.of(15, 5), LocalTime.of(15, 55), "LH 2"));

            timetableRepository.saveAll(kmctTimetable);
            System.out.println(">>> SEED: Real S3 CSE & S3 AI&DS KMCT Timetables successfully seeded.");
        }
    }
}
