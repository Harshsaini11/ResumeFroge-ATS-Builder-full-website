const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS for Node.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('./models/User');
const Resume = require('./models/Resume');
const verifyToken = require('./middleware/authMiddleware');

const app = express();

// Enhanced CORS Configuration for Localhost & Live Server
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json({ limit: '15mb' }));

// In-Memory OTP Store
const otpStore = new Map();

// Root Test Route
app.get('/', (req, res) => {
    res.send('🚀 ResumeForge Backend API is Running Successfully!');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. SEND EMAIL OTP
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email, type } = req.body;
        if (!email) return res.status(400).json({ message: 'Email address is required.' });

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: cleanEmail });

        if (type === 'signup' && existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists!' });
        } else if (type === 'forgot' && !existingUser) {
            return res.status(400).json({ message: 'No account found with this email!' });
        }

        // Generate 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(cleanEmail, { otp: generatedOtp, expiresAt: Date.now() + 5 * 60 * 1000 });

        const mailOptions = {
            from: `"ResumeForge Team" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: '⚡ ResumeForge - Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #2563eb; text-align: center;">ResumeForge Verification</h2>
                    <p>Your security OTP code is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${generatedOtp}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b;">Your OTP will expire in <b>5 minutes</b>.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log(`✅ Mail successfully sent to ${cleanEmail}`))
            .catch(err => console.error("❌ Background Mail Send Error:", err));
        
        return res.status(200).json({ message: `OTP has been sent to your Email (${cleanEmail})!` });

    } catch (err) {
        console.error("❌ Send OTP Error:", err);
        return res.status(500).json({ message: 'Failed to send OTP.' });
    }
});

// 2. SIGNUP WITH EMAIL OTP
app.post('/api/auth/signup-with-otp', async (req, res) => {
    try {
        const { fullName, email, password, otp } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const storedData = otpStore.get(cleanEmail);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP entered!' });
        }
        otpStore.delete(cleanEmail);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email: cleanEmail,
            password: hashedPassword,
            isEmailVerified: true
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ 
            token, 
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email } 
        });

    } catch (err) {
        return res.status(500).json({ message: 'Registration failed: ' + err.message });
    }
});

// 3. RESET PASSWORD WITH EMAIL OTP
app.post('/api/auth/reset-password-otp', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const storedData = otpStore.get(cleanEmail);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP entered!' });
        }

        otpStore.delete(cleanEmail);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email: cleanEmail }, { password: hashedPassword });

        return res.status(200).json({ message: 'Password updated successfully! Please log in.' });
    } catch (err) {
        return res.status(500).json({ message: 'Password update failed: ' + err.message });
    }
});

// 4. LOGIN (EMAIL + PASSWORD)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) return res.status(400).json({ message: 'Email address is required.' });

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password!' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
    } catch (err) {
        return res.status(500).json({ message: 'Login failed: ' + err.message });
    }
});

// 5. CHANGE PASSWORD ROUTE
app.post('/api/auth/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found!' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password!' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully! ✅' });
    } catch (err) {
        console.error("Change Password Error:", err);
        return res.status(500).json({ message: 'Server error while updating password.' });
    }
});

// 6. UPDATE USER PROFILE AVATAR
app.patch('/api/user/avatar', verifyToken, async (req, res) => {
    try {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ message: "Avatar data is required." });

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { avatar } },
            { new: true }
        ).select('-password');

        return res.status(200).json({
            message: "Profile Avatar updated successfully! 📷",
            user: updatedUser
        });
    } catch (err) {
        console.error("Avatar Update Error:", err);
        return res.status(500).json({ message: "Failed to update profile avatar." });
    }
});

// 7. GET USER PROFILE & RESUME HISTORY LIST
app.get('/api/auth/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });

        return res.status(200).json({
            user,
            resumes,
            totalResumes: resumes.length
        });
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        return res.status(500).json({ message: 'Server error while fetching profile.' });
    }
});

// 8. SAVE OR UPDATE RESUME
app.post('/api/resume/save', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { resumeId, ...resumeData } = req.body;

        if (resumeId && resumeId.trim() !== '') {
            if (!mongoose.Types.ObjectId.isValid(resumeId)) {
                return res.status(400).json({ message: "Invalid Resume ID format!" });
            }

            const updatedResume = await Resume.findOneAndUpdate(
                { _id: resumeId, userId },
                { $set: resumeData },
                { new: true, runValidators: true }
            );

            if (!updatedResume) {
                return res.status(404).json({ message: "Resume not found or unauthorized access!" });
            }

            return res.status(200).json({ 
                message: "Resume updated in history! ✅", 
                resume: updatedResume 
            });
        } else {
            const newResume = new Resume({
                userId,
                ...resumeData
            });

            await newResume.save();

            return res.status(201).json({ 
                message: "New Resume added to your history! 🎉", 
                resume: newResume 
            });
        }
    } catch (err) {
        console.error("Save Resume Error:", err);
        return res.status(500).json({ 
            message: "Server error while saving resume data: " + err.message 
        });
    }
});

// 9. GET SINGLE RESUME FOR EDITING
app.get('/api/resume/get/:id', verifyToken, async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found in your account." });
        }
        return res.status(200).json({ resume });
    } catch (err) {
        console.error("Fetch Resume Error:", err);
        return res.status(500).json({ message: "Server error while loading resume." });
    }
});

// 10. DELETE A RESUME FROM HISTORY
app.delete('/api/resume/delete/:id', verifyToken, async (req, res) => {
    try {
        const deletedResume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedResume) {
            return res.status(404).json({ message: "Resume not found or unauthorized." });
        }
        return res.status(200).json({ message: "Resume deleted from history successfully! 🗑️" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete resume." });
    }
});

// 🌐 GOOGLE DIRECT LOGIN / SIGNUP ROUTE
app.post('/api/auth/google-login', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token is required!" });

        // Decode JWT payload directly (No external client library needed)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const { email, name, picture } = payload;
        const cleanEmail = email.trim().toLowerCase();

        // Check if user exists in MongoDB
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            // Auto Register new user via Google
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = new User({
                fullName: name || 'Google User',
                email: cleanEmail,
                password: dummyPassword,
                avatar: picture || '',
                isEmailVerified: true
            });
            await user.save();
        } else if (picture && !user.avatar) {
            user.avatar = picture;
            await user.save();
        }

        // Create JWT App Token
        const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "Google Auth successful!",
            token: authToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error("Google Auth Route Error:", err);
        return res.status(500).json({ message: "Google Auth failed: " + err.message });
    }

    // 📊 ADMIN ROUTE: Total Users & Resumes Count
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalResumes = await Resume.countDocuments();
        const latestUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);

        return res.status(200).json({
            totalUsers,
            totalResumes,
            latestUsers
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
