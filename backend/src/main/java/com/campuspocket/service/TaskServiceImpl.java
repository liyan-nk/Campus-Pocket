package com.campuspocket.service;

import com.campuspocket.dto.TaskRequest;
import com.campuspocket.model.Student;
import com.campuspocket.model.Task;
import com.campuspocket.repository.StudentRepository;
import com.campuspocket.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final StudentRepository studentRepository;

    public TaskServiceImpl(TaskRepository taskRepository, StudentRepository studentRepository) {
        this.taskRepository = taskRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<Task> getTasks(String rollNo) {
        return taskRepository.findByStudentRollNoOrderByDueDateAsc(rollNo);
    }

    @Override
    @Transactional
    public Task createTask(String rollNo, TaskRequest request) {
        Student student = studentRepository.findByRollNo(rollNo)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        Task task = new Task(
            student,
            request.getTitle().trim(),
            request.getDescription() != null ? request.getDescription().trim() : null,
            request.getDueDate(),
            request.isCompleted()
        );

        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public Task updateTask(String rollNo, Long taskId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found."));

        // Enforce ownership check
        if (!task.getStudent().getRollNo().equalsIgnoreCase(rollNo)) {
            throw new SecurityException("Access denied. You do not own this task.");
        }

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        task.setDueDate(request.getDueDate());
        task.setCompleted(request.isCompleted());

        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public void deleteTask(String rollNo, Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found."));

        // Enforce ownership check
        if (!task.getStudent().getRollNo().equalsIgnoreCase(rollNo)) {
            throw new SecurityException("Access denied. You do not own this task.");
        }

        taskRepository.delete(task);
    }
}
