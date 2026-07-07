# Campus Pocket — Project Context

## 1. Project Overview

Project Name: Campus Pocket

Campus Pocket is a mobile-first academic companion application for verified college students.

The goal of the project is not to create a complete college management system. The goal is to create a simple, fast, and useful daily companion that helps students view their academic schedule, track their attendance, and manage their personal academic tasks.

The application should feel like a real mobile application even though it is web based.

Core philosophy:

"College data is managed centrally. Personal data is managed by the student."

---

# 2. Development Principle

Campus Pocket must stay minimal.

Priority order:

1. Security
2. Simplicity
3. User Experience
4. Features

Do not add complexity unless it directly improves the student's daily experience.

A student should understand the application within 10 seconds of opening it.

---

# 3. Technology Stack

## Backend

Language:

* Java

Framework:

* Spring Boot

Recommended:

* Spring Security
* Spring Data JPA
* Maven
* BCrypt password hashing

Database:

Development:

* PostgreSQL / MySQL / SQLite

Production-ready approach:

* Any free database hosting solution

---

## Frontend

Framework:

* React
* Vite

Styling:

* Tailwind CSS

Design:

* Mobile-first responsive design

The UI should prioritize:

* Clean layouts
* Rounded cards
* Bottom navigation
* Fast interactions
* Modern mobile application feeling

---

# 4. User Roles

The system has two roles internally:

1. Student
2. Admin

Students must never see anything related to the admin side.

No admin buttons.
No admin navigation.
No admin hints.

Admin access must exist only through a dedicated hidden route.

Example:

/admin

The admin route requires username and password authentication.

---

# 5. Authentication System

Campus Pocket is a closed registration system.

Public user registration is not allowed.

Only pre-approved students can activate an account.

---

## Student Account Activation Flow

Admin creates student records first.

Stored information:

* Roll number
* Name
* Phone number
* Department
* Semester
* Batch
* Activation code

The student opens Campus Pocket:

Step 1:
Enter roll number

Step 2:
Enter activation code

Step 3:
Create password

After successful activation:

* Account becomes active
* Activation code cannot be reused

---

## Student Login Flow

Student logs in using:

* Roll number
* Password

Passwords must never be stored directly.

Only hashed passwords should be stored.

Use BCrypt.

---

## Password Reset

No email OTP.
No SMS OTP.

If a student forgets the password:

Student contacts admin.

Admin verifies the student offline.

Admin resets password.

System creates a temporary password.

Student logs in using temporary password.

Student must create a new password.

---

# 6. Student Features

## Dashboard

Purpose:

Answer the question:

"What does the student need to know right now?"

Dashboard displays:

* Greeting
* Current day
* Next class
* Today's schedule summary
* Attendance overview
* Pending task summary

---

# Timetable

Timetable is READ ONLY for students.

Students cannot:

* Create timetable
* Edit timetable
* Delete timetable
* Add subjects

Academic data is centrally managed.

The timetable is assigned based on:

* Department
* Semester
* Batch

Example:

Student:

Department: CSE
Semester: S3
Batch: A

Receives:

CSE S3 A timetable automatically.

---

# Attendance System

Students do not manually create subjects.

Attendance is based on the official timetable.

For each class/hour:

Student can mark:

* Present
* Absent

The system calculates attendance percentage automatically.

Example:

Data Structures

Present:
24

Total:
30

Attendance:
80%

---

# Tasks

Tasks are personal student data.

Students can:

* Create task
* View tasks
* Update tasks
* Delete tasks
* Mark completed

Examples:

* Submit Java record
* Finish assignment
* Study module

Tasks belong only to the student who created them.

---

# 7. Admin Features

The admin panel must remain minimal.

Admin can:

Manage Students:

* Add student
* View students
* Reset password
* Disable account

Manage Timetable:

* Add timetable entries
* Update timetable
* Delete timetable entries

No unnecessary analytics.
No dashboards unless required.

---

# 8. Database Concept

Suggested entities:

## Student

Fields:

* rollNo (Primary Key)
* name
* phone
* department
* semester
* batch
* passwordHash
* activationCodeHash
* activated
* mustChangePassword

---

## Admin

Fields:

* id
* username
* passwordHash

---

## Timetable

Fields:

* id
* department
* semester
* batch
* subject
* faculty
* day
* startTime
* endTime
* room

---

## Attendance

Fields:

* id
* rollNo
* timetableId
* date
* status

---

## Task

Fields:

* id
* rollNo
* title
* description
* dueDate
* completed

---

# 9. Features NOT Allowed

Do not implement:

* Public signup
* Email login
* SMS OTP
* Google authentication
* Student timetable editing
* Student subject creation
* Chat system
* Payment system
* AI features
* Social media features

Avoid feature creep.

---

# 10. Design Direction

Campus Pocket should feel like a premium mobile application.

Design inspiration:

* Modern iOS applications
* Notion-style simplicity
* Clean productivity tools

Important:

Design for mobile screens first.

Desktop support is secondary.

---

# 11. Development Instructions

Before coding:

1. Understand this document completely.
2. Do not add features without approval.
3. Create an implementation plan.
4. Implement step-by-step.
5. Keep the project simple and maintainable.

The final goal:

A real student should be able to install Campus Pocket and use it every day without needing instructions.
