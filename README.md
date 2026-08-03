# ⚡ ResumeForge - Dynamic ATS Resume Builder

![ResumeForge Banner](https://img.shields.io/badge/ATS--Friendly-100%25-brightgreen?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2F%20Vanilla%20JS-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

> **ResumeForge** is a modern, high-speed web application designed to help job seekers create recruiter-compliant, ATS-friendly resumes in minutes. Features live real-time preview, customizable accent colors/fonts, OTP email verification, Google OAuth, and cloud-synced profile history.

---

## ✨ Features

- 🎯 **ATS-Optimized Templates:** Choose from 10+ professional single-column, two-column, and creative layouts designed to bypass Applicant Tracking Systems.
- ⚡ **Real-time Live Preview:** Dynamically renders changes, font variations, and custom color accents as you type.
- 🔐 **Secure User Authentication:** Supports Signup/Reset via Email OTP verification (Nodemailer) and Google Sign-In.
- 📂 **Cloud Sync & Account History:** Save multiple resumes under your account and load/edit them anytime from your Profile Dashboard.
- 🖼️ **Profile Photo & Avatar Customization:** Built-in support for uploading high-res profile pictures with customizable shapes (circle/square) and account avatar management.
- 🖨️ **Direct PDF Export:** High-quality vector PDF generation optimized for standard print & job applications.
- 🖐️ **Drag-and-Drop Form Customization:** Easily reorder and add custom sections (Certifications, Awards, Languages, Projects).

---

## 🛠️ Tech Stack

### **Frontend**
- **HTML5 & CSS3:** Responsive UI with custom drawer panels, CSS variables, and keyframe animations.
- **JavaScript (Vanilla ES6+):** Async/Await fetch calls, DOM manipulation, and dynamic preview rendering.

### **Backend**
- **Node.js & Express.js:** RESTful API architecture for authentication, account profiling, and resume storage.
- **MongoDB & Mongoose:** Schema-flexible database storing structured user history and resume data.
- **JWT (JSON Web Tokens):** Secure session authorization middleware.
- **Nodemailer:** Automated OTP delivery for email verification and password recovery.
- **Bcrypt.js:** Password hashing and encryption.

---

## 📁 Project Structure

```text
RESUMEFORGE/
│
├── client/                     ──► Frontend Source Files
│   ├── css/                    ──► Stylesheets (style.css, auth.css, home.css)
│   ├── js/                     ──► Scripts (script.js, auth.js)
│   ├── home.html               ──► Landing Page
│   ├── index.html              ──► Builder Dashboard
│   ├── login.html              ──► User Login
│   ├── signup.html             ──► User Registration
│   ├── profile.html            ──► User Profile & Saved History
│   └── forgot-password.html    ──► Password Recovery
│
└── server/                     ──► Backend API Server
    ├── middleware/             ──► Token Authentication Middleware
    ├── models/                 ──► Mongoose Data Models (User.js, Resume.js)
    ├── .env                    ──► Environment Secrets
    ├── server.js               ──► Main Express Entry Point
    └── package.json            ──► Server Dependencies
🚀 Quick Start Guide
Prerequisites
Node.js (v18 or higher)

MongoDB Atlas Account or local MongoDB server.

1. Clone the Repository
Bash
git clone [https://github.com/Harshsaini11/ResumeFroge-ATS-Builder-full-website.git]
2. Setup & Run Backend Server
Bash
cd server
npm install
Create a .env file inside the server/ directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
Start the API server:

Bash
npm start
Server will start running at http://127.0.0.1:5000

3. Launch Frontend
Open client/home.html or client/index.html using VS Code Live Server or serve the client/ folder on port 5500.

👤 Author
Harsh Kumar Saini

Email: harshsaini0828@gmail.com

Target Role: Web Developer & Software Developer

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
