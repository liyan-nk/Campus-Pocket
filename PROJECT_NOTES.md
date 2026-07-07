# Project Notes — Campus Pocket

## 1. Temporary Security Configuration
* **Status:** Resolved in Phase 2.
* **Resolution:** Removed `TempSecurityConfig.java` and implemented a proper `SecurityConfig.java` with Spring Security session management and authority checking.

## 2. Default Admin Credentials
* **Current Development Credentials:**
  * **Username:** `admin`
  * **Password:** `admin123`
* **Allowed Context:** Development/local testing only.
* **Security Risk:** High.
* **Action:** Before any real deployment, change default credentials in `DataInitializer` or migrate to dynamic admin provisioning.

## 3. Database Decision
* **Current State:** H2 file-based database (`jdbc:h2:file:./data/campuspocket`).
* **Reason:** Zero cost, zero-configuration local installation, perfect for mini project demonstration.
* **Future Work:** Can easily migrate to PostgreSQL or MySQL by modifying properties in `application.properties` and including the appropriate Maven driver.

## 4. Frontend Status Dashboard
* **Status:** Resolved in Phase 2.
* **Resolution:** Replaced the dummy status screen with tabbed student login/activation forms and a dedicated administrative sign-in console.

## 5. REST API CSRF Protection
* **Current State:** CSRF protection is disabled (`csrf.disable()`) in `SecurityConfig`.
* **Reason:** Reduces complexity for REST API endpoints and local demonstration testing.
* **Mitigation:** The application routes are proxied through Vite same-origin (`/api` proxy), reducing direct cross-domain vulnerability risk.
* **Future Work:** For full production security, configure Cookie-based CSRF tokens (using Spring Security's `CookieCsrfTokenRepository`) and append the header in the frontend Fetch/Axios interceptors.

## 6. Activation Codes & Temporary Passwords
* **Current State:** Generated using `SecureRandom` as `ACT-XXXXXX` and `TEMP-XXXXXX` (where XXXXXX is 6 characters of random uppercase alphanumeric values).
* **Security Decision:** To preserve privacy and security, only the BCrypt hashes of these values are stored in the database. The plain codes are returned to the administrator exactly **once** upon creation or reset.

## 7. Attendance Philosophy
* **Philosophy:** Campus Pocket attendance tracking is student self-reported. The purpose is personal attendance awareness, not official college attendance verification.
* **Constraints:** Do not implement:
  * QR attendance
  * Location tracking
  * Faculty approval
  * Biometric verification

