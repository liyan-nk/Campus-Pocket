# Campus Pocket — Student Companion App

Campus Pocket is a mobile-first, distraction-free academic companion designed for verified college students. It provides students with a fast and intuitive interface to view their schedules, track self-reported attendance, and manage their personal academic tasks. 

Unlike heavy college ERP systems, Campus Pocket stays minimal, prioritizes security, and can be fully understood by a student within 10 seconds of opening.

---

## 📖 Core Philosophy
> *"College data is managed centrally. Personal data is managed by the student."*

Students have read-only access to academic schedules (configured centrally by administrators), while their self-reported attendance checklists and personal to-do lists are kept completely private and under their own control.

---

## 🛠️ Technology Stack

### Backend API
* **Language/Framework:** Java 17+ / Spring Boot 3.3
* **Security:** Spring Security (REST Cookie Session management with HTTP-only cookies)
* **Data Access:** Spring Data JPA with H2 (Persistent file database for local development)
* **Encryption:** BCrypt Password Hashing (used for both student passwords and activation codes)
* **Build System:** Maven

### Frontend Client
* **Framework:** React 19 / Vite 8 (Single Page Application)
* **Styling:** Tailwind CSS v4 (native Vite integration)
* **Icons:** Lucide React
* **Client Proxy:** Dev-server proxy mapping `/api/*` requests to `localhost:8080`

---

## 🚀 Setup & Launch Instructions

### Prerequisites
* Java Development Kit (JDK) 17 or higher
* Node.js (v18 or higher) and NPM

### 1. Launching the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The backend starts on `http://localhost:8080`.
   * H2 Database files are saved inside `/backend/data/campuspocket.mv.db`.
   * On startup, the database is auto-seeded with default admin credentials, a sample pre-approved student record, and a default schedule.

### 2. Launching the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the node modules (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`. Any API calls to `/api` are automatically proxied to the backend.

---

## 🔑 Default Development Credentials

For testing and demonstration, use the following pre-seeded records:

### 1. Control Console (Admin)
* **Hidden Route:** `http://localhost:5173/cp-control`
* **Username:** `admin`
* **Password:** `admin123`

### 2. Pre-approved Student Record
* **Roll Number:** `CS202601`
* **Activation Code:** `ACT8888`
* *(Activate your account on the main screen to set a custom password, e.g. `mypass123`)*

---

## 📱 Screens Overview

### Student Interface (Mobile-First Card Layout)
1. **Login & Activation (`/`):** Unified tabbed portal. Students can enter credentials to log in, or input pre-approved Roll Numbers + Activation Codes to set passwords and activate their account.
2. **Dashboard (`/dashboard`):** Real-time summary showing local date banner, the upcoming class slot (with name, timings, room), a dynamic greeting, and today's class checklist to mark attendance (Present/Absent). Displays the pending tasks counter.
3. **Schedule (`/timetable`):** Read-only swiper displaying the student's weekly schedule day-by-day (e.g. Mon, Tue). Sorted by day and start timings.
4. **Tracker (`/attendance`):** Self-reported attendance overview. Shows the overall ratio, counter grids, and individual subject cards with progress indicators (warns in amber if a subject falls below 75%).
5. **Tasks (`/tasks`):** Incomplete task lists sorted by due dates. Includes collapsible inputs to add or edit tasks, completion toggles, and delete controls. Shows completed tasks at the bottom.
6. **Profile (`/profile`):** Personal detail records with password updates and log out actions.
7. **Forced Reset (`/force-password`):** Redirection guard blocking access to other pages if an administrator has flagged the account for a forced password change.

### Administrator Interface (Control Panel)
1. **Control Console Login (`/cp-control`):** Isolated username/password authorization portal.
2. **Dashboard Control Panel (`/cp-control/dashboard`):**
   * **Student Management:** Grid tables displaying student statuses, search filters, account lock switches (Enable/Disable), password reset triggers, and sidebar registration inputs.
   * **Timetable Editor:** Fully integrated timetable scheduler supporting slots additions, edits, and deletions.

---

## 🔒 Security Architectures

1. **HTTP-only Cookie Session Security:** No JWT tokens or authentication keys are saved in browser `localStorage` (protecting the app against XSS extraction). Instead, successful login sets a secure, HTTP-only `JSESSIONID` cookie which is managed by the browser and isolated from client-side scripts.
2. **Double BCrypt Encryption:** All passwords and activation codes are encrypted before database persistence using BCrypt. Unactivated activation codes are stored solely as hashes, ensuring database compromises do not leak valid entry codes.
3. **API Access Control Lists (ACL):** Requests targeting administrative paths `/api/admin/**` are guarded in Spring Security, checking authority parameters. Mismatched roles (such as students attempting to access admin APIs) are rejected.
4. **Service-Layer Task Ownership Validation:** Every task CRUD action verifies that the owner of the target task ID matches the authenticated principal's Roll Number. Students cannot read, modify, or delete tasks belonging to other accounts.
