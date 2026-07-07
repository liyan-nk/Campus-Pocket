package com.campuspocket.repository;

import com.campuspocket.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStudentRollNoOrderByDueDateAsc(String rollNo);
    long countByStudentRollNoAndCompleted(String rollNo, boolean completed);
    void deleteByStudentRollNo(String rollNo);
}
