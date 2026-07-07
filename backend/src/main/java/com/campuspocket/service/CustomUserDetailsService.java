package com.campuspocket.service;

import com.campuspocket.model.Admin;
import com.campuspocket.model.Student;
import com.campuspocket.repository.AdminRepository;
import com.campuspocket.repository.StudentRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    public CustomUserDetailsService(StudentRepository studentRepository, AdminRepository adminRepository) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Check if the username belongs to a Student (Roll Number)
        Optional<Student> studentOpt = studentRepository.findByRollNo(username);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            return new User(
                student.getRollNo(),
                student.getPasswordHash() != null ? student.getPasswordHash() : "", 
                student.isEnabled(), // enabled status checked here
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
            );
        }

        // 2. Check if the username belongs to an Admin
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return new User(
                admin.getUsername(),
                admin.getPasswordHash(),
                true,
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        throw new UsernameNotFoundException("User not found with identifier: " + username);
    }
}
