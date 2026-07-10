package com.campuspocket.repository;

import com.campuspocket.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentRollNo(String rollNo);
    List<Attendance> findTop60ByStudentRollNoOrderByDateDesc(String rollNo);
    List<Attendance> findByStudentRollNoAndDate(String rollNo, LocalDate date);
    Optional<Attendance> findByStudentRollNoAndTimetableIdAndDate(String rollNo, Long timetableId, LocalDate date);
    void deleteByStudentRollNo(String rollNo);
}
