const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    theme: { type: String, default: 'modern_classic' },
    theme_color: { type: String, default: '#2563eb' },
    font_family: { type: String, default: "Calibri, 'Segoe UI', Arial, sans-serif" },
    full_name: { type: String, default: '' },
    role: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    summary: { type: String, default: '' },
    profile_photo: { type: String, default: '' },
    photo_shape: { type: String, default: 'circle' },
    
    // Support for structured/ordered sections sent by builder
    ordered_sections: { type: Array, default: [] },
    
    // Backwards Compatibility Fields
    personalDetails: {
        fullName: String,
        role: String,
        email: String,
        phone: String,
        location: String,
        github: String,
        linkedin: String,
        summary: String,
        profilePhoto: String,
        photoShape: { type: String, default: 'circle' }
    }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Resume', resumeSchema);