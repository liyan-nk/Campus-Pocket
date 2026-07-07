package com.campuspocket.repository;

import com.campuspocket.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByRollNo(String rollNo);
    java.util.List<Student> findByRollNoContainingIgnoreCaseOrNameContainingIgnoreCase(String rollNo, String name);
}
