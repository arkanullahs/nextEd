const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const Course = require('../models/course.model');

const router = express.Router();

function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).send('Admin access required.');
}

// Users awaiting approval
router.get('/users/pending', auth, requireAdmin, async (req, res) => {
    const users = await User.find({ role: { $in: ['student', 'teacher'] }, status: { $in: ['pending'] } }).select('-password');
    res.send(users);
});

router.post('/users/:id/approve', auth, requireAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    user.status = 'approved';
    user.approved = true;
    await user.save();
    res.send({ message: 'User approved' });
});

router.post('/users/:id/reject', auth, requireAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    user.status = 'rejected';
    user.approved = false;
    await user.save();
    res.send({ message: 'User rejected' });
});

// Basic user update (admin)
router.put('/users/:id', auth, requireAdmin, async (req, res) => {
    const updates = { ...req.body };
    delete updates.password; // do not allow plain password here
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).send('User not found');
    res.send(user);
});

// Reset password (admin)
router.post('/users/:id/reset-password', auth, requireAdmin, async (req, res) => {
    const bcrypt = require('bcrypt');
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    if (!req.body.password) return res.status(400).send('Password is required');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    res.send({ message: 'Password reset successful' });
});

// Courses pending approval
router.get('/courses/pending', auth, requireAdmin, async (req, res) => {
    const courses = await Course.find({ status: 'pending' }).select('-videos');
    res.send(courses);
});

router.post('/courses/:id/approve', auth, requireAdmin, async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send('Course not found');
    course.status = 'approved';
    await course.save();
    res.send({ message: 'Course approved' });
});

router.post('/courses/:id/reject', auth, requireAdmin, async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send('Course not found');
    course.status = 'rejected';
    await course.save();
    res.send({ message: 'Course rejected' });
});

module.exports = router;