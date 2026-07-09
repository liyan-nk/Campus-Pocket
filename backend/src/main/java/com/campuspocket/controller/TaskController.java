package com.campuspocket.controller;

import com.campuspocket.dto.TaskRequest;
import com.campuspocket.model.Task;
import com.campuspocket.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(Authentication authentication) {
        String rollNo = authentication.getName();
        return ResponseEntity.ok(taskService.getTasks(rollNo));
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskRequest request, Authentication authentication) {
        String rollNo = authentication.getName();
        try {
            return ResponseEntity.ok(taskService.createTask(rollNo, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable("id") Long id, @Valid @RequestBody TaskRequest request, Authentication authentication) {
        String rollNo = authentication.getName();
        try {
            Task task = taskService.updateTask(rollNo, id, request);
            return ResponseEntity.ok(task);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable("id") Long id, Authentication authentication) {
        String rollNo = authentication.getName();
        try {
            taskService.deleteTask(rollNo, id);
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
