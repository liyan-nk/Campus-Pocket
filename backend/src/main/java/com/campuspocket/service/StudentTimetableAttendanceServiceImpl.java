package com.campuspocket.service;

import com.campuspocket.dto.*;
import com.campuspocket.model.*;
import com.campuspocket.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentTimetableAttendanceServiceImpl implements StudentTimetableAttendanceService {

    private final StudentRepository studentRepository;
    private final TimetableRepository timetableRepository;
    private final AttendanceRepository attendanceRepository;
    private final TaskRepository taskRepository;

    public StudentTimetableAttendanceServiceImpl(StudentRepository studentRepository, 
                                                 TimetableRepository timetableRepository, 
                                                 AttendanceRepository attendanceRepository,
                                                 TaskRepository taskRepository) {
        this.studentRepository = studentRepository;
        this.timetableRepository = timetableRepository;
        this.attendanceRepository = attendanceRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public List<Timetable> getStudentTimetable(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        String normDept = normalizeDepartment(student.getDepartment());
        String normSem = normalizeSemester(student.getSemester());
        String normBatch = normalizeBatch(student.getBatch());

        List<Timetable> entries = timetableRepository.findByDepartmentAndSemesterAndBatch(
            normDept, normSem, normBatch
        );

        // Sort by Day order (Monday -> Sunday) and then by Start Time
        entries.sort((t1, t2) -> {
            int dayCompare = Integer.compare(getDayWeight(t1.getDay()), getDayWeight(t2.getDay()));
            if (dayCompare != 0) {
                return dayCompare;
            }
            return t1.getStartTime().compareTo(t2.getStartTime());
        });

        return entries;
    }

    @Override
    @Transactional
    public void markAttendance(String rollNo, AttendanceMarkRequest request) {
        // Rule: Only today's attendance can be marked or updated
        if (!request.getDate().equals(LocalDate.now())) {
            throw new IllegalArgumentException("You can only mark or update attendance for the current day.");
        }

        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        Timetable slot = timetableRepository.findById(request.getTimetableId())
            .orElseThrow(() -> new IllegalArgumentException("Timetable slot not found."));

        // Validate that this class slot matches the student's academic profile (Normalized comparison)
        String normStudentDept = normalizeDepartment(student.getDepartment());
        String normStudentSem = normalizeSemester(student.getSemester());
        String normStudentBatch = normalizeBatch(student.getBatch());

        String normSlotDept = normalizeDepartment(slot.getDepartment());
        String normSlotSem = normalizeSemester(slot.getSemester());
        String normSlotBatch = normalizeBatch(slot.getBatch());

        if (!normSlotDept.equalsIgnoreCase(normStudentDept) ||
            !normSlotSem.equalsIgnoreCase(normStudentSem) ||
            !normSlotBatch.equalsIgnoreCase(normStudentBatch)) {
            throw new IllegalArgumentException("Unauthorized. This class slot is not in your academic timetable.");
        }

        String cleanStatus = request.getStatus().toUpperCase().trim();
        if (!"PRESENT".equals(cleanStatus) && !"ABSENT".equals(cleanStatus)) {
            throw new IllegalArgumentException("Invalid status. Must be PRESENT or ABSENT.");
        }

        // Check if attendance already marked for this class slot and date
        Optional<Attendance> existingOpt = attendanceRepository.findByStudentRollNoAndTimetableIdAndDate(
            rollNo, request.getTimetableId(), request.getDate()
        );

        if (existingOpt.isPresent()) {
            // Update status
            Attendance existing = existingOpt.get();
            existing.setStatus(cleanStatus);
            attendanceRepository.save(existing);
        } else {
            // Create new record
            Attendance record = new Attendance(student, slot, request.getDate(), cleanStatus);
            attendanceRepository.save(record);
        }
    }

    @Override
    public AttendanceSummaryResponse getAttendanceSummary(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        List<Attendance> records = attendanceRepository.findByStudentRollNo(rollNo);

        // Group by subject (case-insensitive)
        Map<String, List<Attendance>> grouped = records.stream()
            .collect(Collectors.groupingBy(r -> r.getTimetable().getSubject().trim()));

        List<SubjectAttendanceStats> statsList = new ArrayList<>();
        int totalClasses = 0;
        int totalPresent = 0;
        int totalAbsent = 0;

        for (Map.Entry<String, List<Attendance>> entry : grouped.entrySet()) {
            String subject = entry.getKey();
            List<Attendance> subjectRecords = entry.getValue();

            int present = (int) subjectRecords.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            int absent = (int) subjectRecords.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();
            int total = present + absent;

            double percentage = total > 0 ? (present * 100.0) / total : 100.0;
            
            // Round to 1 decimal place
            percentage = Math.round(percentage * 10.0) / 10.0;

            statsList.add(new SubjectAttendanceStats(subject, present, absent, total, percentage));

            totalClasses += total;
            totalPresent += present;
            totalAbsent += absent;
        }

        // Sort stats by subject name alphabetically
        statsList.sort(Comparator.comparing(SubjectAttendanceStats::getSubject));

        double overallPercentage = totalClasses > 0 ? (totalPresent * 100.0) / totalClasses : 100.0;
        overallPercentage = Math.round(overallPercentage * 10.0) / 10.0;

        return new AttendanceSummaryResponse(statsList, totalClasses, totalPresent, totalAbsent, overallPercentage);
    }

    @Override
    public StudentDashboardResponse getStudentDashboard(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        LocalDate todayDate = LocalDate.now();
        String todayDayString = getCapitalizedDay(todayDate);

        // Fetch student's timetable entries for today (Normalized comparison)
        String normDept = normalizeDepartment(student.getDepartment());
        String normSem = normalizeSemester(student.getSemester());
        String normBatch = normalizeBatch(student.getBatch());

        List<Timetable> allTimetables = timetableRepository.findByDepartmentAndSemesterAndBatch(
            normDept, normSem, normBatch
        );

        List<Timetable> todayTimetables = allTimetables.stream()
            .filter(t -> t.getDay().equalsIgnoreCase(todayDayString))
            .sorted(Comparator.comparing(Timetable::getStartTime))
            .collect(Collectors.toList());

        // Fetch marked attendance for today
        List<Attendance> todayAttendance = attendanceRepository.findByStudentRollNoAndDate(rollNo, todayDate);
        Map<Long, String> attendanceMap = todayAttendance.stream()
            .collect(Collectors.toMap(a -> a.getTimetable().getId(), Attendance::getStatus));

        // Map today's classes to status DTO
        List<TodayClassStatus> todayClasses = todayTimetables.stream()
            .map(t -> {
                String status = attendanceMap.getOrDefault(t.getId(), "UNMARKED");
                return new TodayClassStatus(t, status);
              })
            .collect(Collectors.toList());

        // Calculate next class
        LocalTime nowTime = LocalTime.now();
        TodayClassStatus nextClass = todayClasses.stream()
            .filter(c -> c.getTimetable().getStartTime().isAfter(nowTime))
            .findFirst()
            .orElse(null);

        // Fetch pending tasks count
        int pendingTasksCount = (int) taskRepository.countByStudentRollNoAndCompleted(rollNo, false);

        return new StudentDashboardResponse(
            student.getName(),
            student.getDepartment(),
            student.getSemester(),
            student.getBatch(),
            todayDate,
            nextClass,
            todayClasses,
            pendingTasksCount
        );
    }

    // HELPERS

    private String normalizeDepartment(String dept) {
        if (dept == null) return "";
        return dept.trim().toUpperCase();
    }

    private String normalizeSemester(String sem) {
        if (sem == null) return "";
        String s = sem.replaceAll("(?i)semester", "").replaceAll("\\s+", "").toUpperCase();
        if (s.matches("^S+\\d+$")) {
            return "S" + s.replaceAll("^S+", "");
        }
        return s;
    }

    private String normalizeBatch(String batch) {
        if (batch == null) return "";
        String b = batch.replaceAll("(?i)batch", "").replaceAll("\\s+", "").toUpperCase();
        if (b.length() > 1 && b.startsWith("B")) {
            return b.substring(1);
        }
        return b;
    }

    private int getDayWeight(String day) {
        switch (day.toLowerCase()) {
            case "monday": return 1;
            case "tuesday": return 2;
            case "wednesday": return 3;
            case "thursday": return 4;
            case "friday": return 5;
            case "saturday": return 6;
            case "sunday": return 7;
            default: return 8;
        }
    }

    private String getCapitalizedDay(LocalDate date) {
        String name = date.getDayOfWeek().name(); // MONDAY
        return name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase(); // Monday
    }
}
