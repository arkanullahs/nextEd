const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    whatYouWillLearn: [{ type: String }],
    videos: [{ type: String }],
    // Admin approval for course publishing
    isApproved: { type: Boolean, default: false },
    // Optional reason when rejected by admin
    rejectionReason: { type: String }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;