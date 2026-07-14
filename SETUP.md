# StayMate Setup & Integration Configuration Guide

This guide describes how to configure StayMate with real external services (Google Maps, Cloudinary, Razorpay, Google OAuth, and SMTP Mailers) or run it locally in zero-dependency Sandbox mode.

---

## 1. Environment Variable Templates

StayMate uses separate `.env` files for backend and frontend. You can copy the template files:
* Frontend Template: `frontend/.env.example` -> `frontend/.env`
* Backend Template: `backend/.env.example` -> `backend/.env`

---

## 2. External Services Setup

### Google Maps Platform
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `StayMate`.
3. Go to **APIs & Services > Library** and enable the following APIs:
   * **Maps JavaScript API** (for map rendering on property sheets)
   * **Places API** (for autocomplete location suggestions)
   * **Geocoding API** (for converting addresses to coordinates)
4. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
5. Copy the generated API Key.
6. Configure the key:
   * **Frontend (`frontend/.env`)**: Set `VITE_GOOGLE_MAPS_KEY=your_copied_api_key`
7. *Production recommendation*: Restrict the API key under settings to restrict calls to your production domain referrer.

### Cloudinary (Image & File Uploads)
1. Register or sign in at [Cloudinary](https://cloudinary.com/).
2. Go to the Cloudinary Dashboard Console.
3. Locate your **Cloud Name**, **API Key**, and **API Secret** in the Product Environment credentials section.
4. Configure these in **Backend (`backend/.env`)**:
   ```env
   CLOUDINARY_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET=your_cloudinary_api_secret
   ```

### Razorpay (Payments)
1. Sign up or log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (or **Live Mode** if ready for production).
3. Go to **Account & Settings > API Keys > Generate Key**.
4. Copy the generated **Key ID** and **Key Secret**.
5. Configure these in **Backend (`backend/.env`)**:
   ```env
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

### Google OAuth (Authentication)
1. Open the [Google Cloud Console Credentials Dashboard](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials > OAuth Client ID**.
3. Set the application type to **Web Application**.
4. Under **Authorized JavaScript Origins**, add:
   * `http://localhost:5173` (for local development)
   * `https://yourdomain.com` (for production)
5. Copy the generated **Client ID** and **Client Secret**.
6. Configure:
   * **Frontend (`frontend/.env`)**: `VITE_GOOGLE_CLIENT_ID=your_client_id`
   * **Backend (`backend/.env`)**:
     ```env
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```

### Email Service (SMTP)
StayMate supports standard SMTP dispatchers (such as Resend SMTP, SendGrid, Gmail App Passwords, or Amazon SES).
1. Obtain the SMTP host, port, username, and password from your transactional email provider.
2. If using **Gmail App Passwords**:
   * Enable 2-Step Verification on your Google Account.
   * Go to security settings and search for **App Passwords**. Generate one named `StayMate`.
3. Configure these in **Backend (`backend/.env`)**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_gmail_address@gmail.com
   SMTP_PASS=your_16_character_app_password
   EMAIL_FROM=no-reply@yourdomain.com
   EMAIL_FROM_NAME=StayMate Security Team
   ```

---

## 3. Sandbox Fallback Mode vs. Production Mode

StayMate is designed to run in **Sandbox mode** out of the box for quick local testing without setting up external APIs.

| Feature | Sandbox / Fallback Behavior (Credentials Omitted) | Production Behavior (Credentials Configured) |
|---|---|---|
| **Google Maps** | Renders an interactive SVG-styled emulator with simulated search and coordinates. | Loads the live Google Maps JS SDK with real-time autocompletes. |
| **Payments** | Displays a local checkout simulator panel allowing signature verify testing. | Triggers the real Razorpay payment modal and verifies webhooks/signatures. |
| **File Storage** | Saves uploaded files directly to the local directory `frontend/public/uploads`. | Uploads optimized media files to the Cloudinary cloud bucket. |
| **Email Service** | Logs verification and password reset HTML email payloads directly to the terminal. | Sends transactional emails using the SMTP transporter. |

---

## 4. Local Installation & Development Commands

1. Clone or download the project workspace.
2. Run installation at the root directory:
   ```bash
   npm run install:all
   ```
3. Copy environment configuration templates and configure active values.
4. Run the development server:
   ```bash
   npm run dev
   ```
   * This executes the backend server on `http://localhost:5000` and the React frontend on `http://localhost:5173` concurrently.
5. Create production builds (frontend only):
   ```bash
   npm run build:frontend
   ```
