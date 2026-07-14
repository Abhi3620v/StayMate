# StayMate — API Documentation (Authentication Module)

All API endpoints are prefixed with `/api/v1`.

---

## 1. Authentication Endpoints

### 1.1 Register User
*   **Method / Route:** `POST /auth/register`
*   **Description:** Provisions a new user account. Triggers a verification email token log in the backend console.
*   **Authentication Required:** No
*   **Request Body (JSON):**
    ```json
    {
      "name": "Abhishek Kumar",
      "email": "abhishek@staymate.com",
      "password": "Password123",
      "role": "tenant"
    }
    ```
*   **Validation Rules:**
    *   `name`: minimum 2 characters.
    *   `email`: must be a valid email format.
    *   `password`: minimum 6 characters, must contain at least one uppercase letter, one lowercase letter, and one number.
    *   `role`: enum `['tenant', 'owner']`.
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Registration successful! Verification email logged to console.",
      "data": {
        "id": "60d0fe4f5311236168a109a1",
        "name": "Abhishek Kumar",
        "email": "abhishek@staymate.com",
        "role": "tenant",
        "status": "email_verification_pending"
      }
    }
    ```
*   **Possible Errors:**
    *   `400 Bad Request` — Validation failures (e.g., password too weak).
    *   `409 Conflict` — Email already registered.

---

### 1.2 Login User
*   **Method / Route:** `POST /auth/login`
*   **Description:** Authenticates user credentials. Returns a short-lived `accessToken` and sets a secure `token` HttpOnly refresh cookie.
*   **Authentication Required:** No
*   **Request Body (JSON):**
    ```json
    {
      "email": "abhishek@staymate.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "data": {
        "user": {
          "id": "60d0fe4f5311236168a109a1",
          "name": "Abhishek Kumar",
          "email": "abhishek@staymate.com",
          "role": "tenant",
          "avatar": "",
          "status": "active",
          "customPermissions": []
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```
*   **Response Headers:**
    *   `Set-Cookie: token=<jwt_refresh_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`

---

### 1.3 Verify Email
*   **Method / Route:** `POST /auth/verify-email`
*   **Description:** Activates a user account using the verification token.
*   **Authentication Required:** No
*   **Request Body (JSON):**
    ```json
    {
      "token": "a8d65a1cb223543cd6548d9de7d8e566..."
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Email verified successfully! Account is now active."
    }
    ```

---

### 1.4 Refresh Token Session
*   **Method / Route:** `POST /auth/refresh-token`
*   **Description:** Renews session. Reads the HttpOnly refresh token cookie and returns a new rotated accessToken and rotated cookie.
*   **Authentication Required:** No (reads request Cookie header)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
          "id": "60d0fe4f5311236168a109a1",
          "name": "Abhishek Kumar",
          "email": "abhishek@staymate.com",
          "role": "tenant",
          "avatar": "",
          "status": "active"
        }
      }
    }
    ```
*   **Possible Errors:**
    *   `401 Unauthorized` — Cookie missing or session invalid/revoked.

---

### 1.5 View Active Sessions
*   **Method / Route:** `GET /auth/sessions`
*   **Description:** Returns a list of active authenticated devices/sessions for the logged-in user.
*   **Authentication Required:** Yes (Access Token)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "60d0fe4f5311236168a109b8",
          "deviceName": "Macbook Pro",
          "browser": "Chrome 122.0.0",
          "operatingSystem": "Mac OS X",
          "ipAddress": "192.168.1.1",
          "loginTimestamp": "2026-07-03T19:50:00.000Z",
          "lastActivity": "2026-07-03T20:10:00.000Z",
          "isCurrent": true
        }
      ]
    }
    ```

---

### 1.6 Revoke Specific Session
*   **Method / Route:** `DELETE /auth/sessions/:id`
*   **Description:** Terminates/logs out a specific active session.
*   **Authentication Required:** Yes (Access Token)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Session terminated successfully."
    }
    ```

---

## 2. User Settings Endpoints

### 2.1 Update Profile Info
*   **Method / Route:** `PATCH /users/profile`
*   **Description:** Modifies profile metadata and preferences.
*   **Authentication Required:** Yes (Access Token)
*   **Request Body (JSON):**
    ```json
    {
      "name": "Abhishek Kumar",
      "username": "abhishek_k",
      "phone": "+919876543210",
      "bio": "Software developer looking for rooms near Sector 62.",
      "preferences": {
        "theme": "dark",
        "language": "en"
      }
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Profile updated successfully.",
      "data": {
        "user": {
          "id": "60d0fe4f5311236168a109a1",
          "name": "Abhishek Kumar",
          "email": "abhishek@staymate.com",
          "role": "tenant",
          "avatar": "",
          "status": "active"
        }
      }
    }
    ```

---

### 2.2 Upload Profile Picture (Cloudinary)
*   **Method / Route:** `POST /uploads/profile-picture`
*   **Description:** Uploads and processes a profile picture via multipart/form-data.
*   **Authentication Required:** Yes (Access Token)
*   **Request Type:** `multipart/form-data`
*   **Parameters:** `image` (binary file)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Avatar uploaded successfully.",
      "data": {
        "avatar": "https://res.cloudinary.com/staymate/image/upload/v12345/avatars/60d0fe.jpg"
      }
    }
    ```
