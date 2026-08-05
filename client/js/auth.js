// Global API URL setup
window.API_BASE = window.location.hostname === '' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000/api'
    : 'https://resumefroge-ats-builder-full-website.onrender.com/api';

const API_BASE = window.API_BASE;

// Eye Icon Password Toggle
function togglePasswordVisibility(inputId, eyeSpan) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        eyeSpan.innerText = '🙈';
    } else {
        input.type = 'password';
        eyeSpan.innerText = '👁️';
    }
}

function protectIndexPage() {
    const token = localStorage.getItem('authToken');
    if (!token) window.location.replace('home.html');
}

function redirectIfLoggedIn() {
    const token = localStorage.getItem('authToken');
    if (token) window.location.replace('index.html');
}

// Send OTP to Email
async function sendOtpToEmail(email, type) {
    try {
        const response = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, type })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(data.message);
            return true;
        } else {
            alert(data.message || 'OTP delivery failed. Please try again.');
            return false;
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        alert('Cannot connect to the backend server. Make sure node server is running.');
        return false;
    }
}

// Sign Up with OTP
async function handleSignUpWithOtp(fullName, email, password, otp) {
    try {
        const response = await fetch(`${API_BASE}/auth/signup-with-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password, otp })
        });
        const data = await response.json();

        if (response.ok) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userName', data.user.fullName);
    localStorage.setItem('userEmail', data.user.email); // 👈 Store real verified email
    alert('🎉 Your account has been created successfully!');
    window.location.href = 'index.html';
}

// Inside handleLogin function in auth.js
if (response.ok) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userName', data.user.fullName);
    localStorage.setItem('userEmail', data.user.email); // 👈 Store real email on login
    window.location.href = 'index.html';
} else {
            alert(data.message);
        }
    } catch (err) {
        alert('Server Error: Verification could not be completed.');
    }
}

// Reset Password
async function handleResetPasswordWithOtp(email, otp, newPassword) {
    try {
        const response = await fetch(`${API_BASE}/auth/reset-password-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await response.json();

        if (response.ok) {
            alert('✅ Password updated successfully! Please log in now.');
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Server Error');
    }
}

// Login with Email
async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userName', data.user.fullName);
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Invalid Credentials');
        }
    } catch (err) {
        alert('A server connection error occurred. Please try again later.');
    }

    // Google Credential Response Handler
async function handleGoogleCredentialResponse(response) {
    try {
        const res = await fetch(`${API_BASE}/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userName', data.user.fullName);
            localStorage.setItem('userEmail', data.user.email);
            if (data.user.avatar) localStorage.setItem('userAvatar', data.user.avatar);

            alert('🎉 Google Sign-In Successful!');
            window.location.href = 'index.html';
        } else {
            alert(`❌ Google Auth Failed: ${data.message}`);
        }
    } catch (err) {
        console.error("Google Auth Error:", err);
        alert('⚠️ Server connection error during Google Sign-In.');
    }
}

window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

}

function handleLogout() {
    localStorage.clear();
    window.location.href = 'home.html';
}
