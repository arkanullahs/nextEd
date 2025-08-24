const express = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    // Students see only approved courses; teachers/admins can see all
    const filter = req.user.role === 'student' ? { status: 'approved' } : {};
    const courses = await Course.find(filter).select('-videos');
    res.send(courses);
});

router.get('/teacher', auth, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).send('Access denied.');
    const courses = await Course.find({ teacher: req.user._id });
    res.send(courses);
});

router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).send('Access denied.');
    }

    const course = new Course({
        ...req.body,
        teacher: req.user._id,
        status: 'pending'
    });

    try {
        await course.save();
        res.send(course);
    } catch (error) {
        res.status(500).send('Error creating course.');
    }
});

router.post('/:id/enroll', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).send('Access denied.');

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send('Course not found.');
    if (course.status !== 'approved') return res.status(400).send('Course not available for enrollment.');

    if (course.enrolledStudents.includes(req.user._id)) {
        return res.status(400).send('You are already enrolled in this course.');
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    const user = await User.findById(req.user._id);
    user.enrolledCourses.push(course._id);
    await user.save();

    res.send('Enrolled successfully.');
});

router.get('/:id', auth, async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send('Course not found.');
    if (req.user.role === 'student' && course.status !== 'approved') return res.status(403).send('Access denied.');

    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isTeacher = course.teacher.toString() === req.user._id;

    if (!isEnrolled && !isTeacher) {
        const { videos, ...courseData } = course.toObject();
        return res.send(courseData);
    }

    res.send(course);
});
// Delete a course
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).send('Access denied.');
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).send('Course not found.');
        }

        if (course.teacher.toString() !== req.user._id) {
            return res.status(403).send('You are not authorized to delete this course.');
        }

        await course.remove();
        res.send({ message: 'Course deleted successfully.' });
    } catch (error) {
        res.status(500).send('Error deleting course.');
    }
});
//edit a course
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).send('Access denied.');
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).send('Course not found.');
        }

        if (course.teacher.toString() !== req.user._id) {
            return res.status(403).send('You are not authorized to update this course.');
        }

        // Update course details
        Object.assign(course, req.body);
        // Any teacher edit requires re-approval
        course.status = 'pending';
        course.rejectionReason = undefined;
        await course.save();
        res.send(course);
    } catch (error) {
        res.status(500).send('Error updating course.');
    }
});

router.get('/getOneCourse/:id', auth, async (req, res) => {
    // Check if the user is a student
    if (req.user.role !== 'student') {
        return res.status(403).send('Access denied by chatro.');
    }

    // Validate the course ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send('Invalid course ID.');
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');

        // Do not expose rejected courses to students
        if (course.status === 'rejected') {
            return res.status(404).send('Course not found.');
        }

        // Only enrolled students can access course details
        const isEnrolled = course.enrolledStudents.map(id => id.toString()).includes(req.user._id);
        if (!isEnrolled) {
            return res.status(403).send('Access denied.');
        }

        // For pending courses, still return full content so enrolled students can continue
        // learning while the course is under edit/review
        res.send(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).send('Error fetching course.');
    }
});

module.exports = router;