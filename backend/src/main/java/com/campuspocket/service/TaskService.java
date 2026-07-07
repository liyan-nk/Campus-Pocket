package com.campuspocket.service;

import com.campuspocket.dto.TaskRequest;
import com.campuspocket.model.Task;

import java.util.List;

public interface TaskService {
    List<Task> getTasks(String rollNo);
    Task createTask(String rollNo, TaskRequest request);
    Task updateTask(String rollNo, Long taskId, TaskRequest request);
    void deleteTask(String rollNo, Long taskId);
}
