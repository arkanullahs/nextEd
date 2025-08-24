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
    whatYouWillLearn: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    liveRoomId: { type: String, default: null },
    liveStartedAt: { type: Date, default: null },
    liveSessionsCount: { type: Number, default: 0 },
    lastLiveEndedAt: { type: Date, default: null }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;