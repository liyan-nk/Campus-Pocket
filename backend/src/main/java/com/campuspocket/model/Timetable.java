package com.campuspocket.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalTime;

@Entity
@Table(name = "timetables")
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private String batch;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String faculty;

    @Column(name = "period_number")
    private Integer periodNumber;

    @Column(name = "subject_code")
    private String subjectCode;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "faculty_code")
    private String facultyCode;

    @Column(name = "faculty_name")
    private String facultyName;

    @Column(name = "class_day", nullable = false)
    private String day; // "Monday", "Tuesday", etc.

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private String room;

    public Timetable() {
    }

    public Timetable(String department, String semester, String batch, String subject, String faculty, 
                     String day, LocalTime startTime, LocalTime endTime, String room) {
        this.department = department;
        this.semester = semester;
        this.batch = batch;
        this.subject = subject;
        this.faculty = faculty;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
    }

    public Timetable(String department, String semester, String batch, String subjectCode, String subjectName, 
                     String facultyCode, String facultyName, Integer periodNumber, String day, 
                     LocalTime startTime, LocalTime endTime, String room) {
        this.department = department;
        this.semester = semester;
        this.batch = batch;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.facultyCode = facultyCode;
        this.facultyName = facultyName;
        this.periodNumber = periodNumber;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        // fallback legacy mapping
        this.subject = subjectName + " (" + subjectCode + ")";
        this.faculty = facultyName + " (" + facultyCode + ")";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Integer getPeriodNumber() {
        return periodNumber;
    }

    public void setPeriodNumber(Integer periodNumber) {
        this.periodNumber = periodNumber;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getFacultyCode() {
        return facultyCode;
    }

    public void setFacultyCode(String facultyCode) {
        this.facultyCode = facultyCode;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }
}
