const express = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const router = express.Router();
const Comment = require('../models/comment.model');

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied.');
    next();
}

router.get('/', auth, async (req, res) => {
    // Students see only approved courses; teachers/admins see their own logic
    const filter = {};
    if (req.user.role === 'student') filter.isApproved = true;
    const courses = await Course.find(filter).select('-videos');
    res.send(courses);
});

router.get('/teacher', auth, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).send('Access denied.');
    const courses = await Course.find({ teacher: req.user._id });
    res.send(courses);
});

// Teacher: total comment stats for their courses
router.get('/teacher/comment-stats', auth, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).send('Access denied.');
    try {
        const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
        const courseIds = teacherCourses.map(c => c._id);
        const totalComments = await Comment.countDocuments({ course: { $in: courseIds } });
        // Per course counts
        const perCourseAgg = await Comment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: '$course', count: { $sum: 1 } } }
        ]);
        const perCourse = {};
        perCourseAgg.forEach(doc => { perCourse[String(doc._id)] = doc.count; });
        res.send({ totalComments, perCourse });
    } catch (error) {
        res.status(500).send('Error fetching comment stats');
    }
});

router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).send('Access denied.');
    }

    const course = new Course({
        ...req.body,
        teacher: req.user._id,
        isApproved: false
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
    const course = await Course.findById(req.params.id).populate('teacher', 'firstName lastName email role');
    if (!course) return res.status(404).send('Course not found.');

    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isTeacher = course.teacher.toString() === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isTeacher && !isAdmin) {
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

        // Update course details (reset approval if significant fields change)
        const updatable = ['imageUrl', 'title', 'description', 'category', 'difficultyLevel', 'price', 'duration', 'whatYouWillLearn', 'videos'];
        updatable.forEach(key => {
            if (req.body[key] !== undefined) {
                course[key] = req.body[key];
            }
        });
        // If teacher made changes, require re-approval
        course.isApproved = false;
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
        const course = await Course.findById(req.params.id).populate('teacher', 'firstName lastName email');
        if (!course) return res.status(404).send('Course not found.');
        if (!course.isApproved) return res.status(403).send('Course is not approved yet.');
        res.send(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).send('Error fetching course.');
    }
});

// COMMENTS
// List comments for a course
router.get('/:id/comments', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');

        const isTeacher = course.teacher.toString() === req.user._id;
        const isAdmin = req.user.role === 'admin';

        const allComments = await Comment.find({ course: req.params.id })
            .sort({ createdAt: -1 })
            .populate('author', 'firstName lastName role');

        let commentsToReturn = allComments;

        if (isAdmin) {
            commentsToReturn = allComments;
        } else if (isTeacher) {
            // Teachers: show approved comments + pending teacher comments only
            commentsToReturn = allComments.filter(c => c.isApproved || (c.author && c.author.role === 'teacher'));
        } else {
            // Students: show approved + own comments (pending or rejected) so they can see status/reason
            commentsToReturn = allComments.filter(c => c.isApproved || String(c.author?._id) === req.user._id);
        }

        res.send(commentsToReturn);
    } catch (error) {
        res.status(500).send('Error fetching comments');
    }
});

// Add a comment (students and teachers can comment)
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) return res.status(400).send('Content is required');
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');
        // Only allow commenting on approved courses
        if (!course.isApproved) return res.status(403).send('Course is not approved yet.');
        const comment = await Comment.create({ course: course._id, author: req.user._id, content, isApproved: req.user.role === 'admin' });
        const populated = await Comment.findById(comment._id).populate('author', 'firstName lastName role');
        res.send(populated);
    } catch (error) {
        res.status(500).send('Error adding comment');
    }
});

// Edit own comment
router.put('/:id/comments/:commentId', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) return res.status(400).send('Content is required');
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).send('Comment not found');
        if (String(comment.course) !== String(course._id)) return res.status(400).send('Comment does not belong to this course');
        const isOwner = String(comment.author) === req.user._id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).send('Not allowed');
        comment.content = content.trim();
        comment.isApproved = isAdmin; // non-admin edits require re-approval
        if (!isAdmin) comment.rejectionReason = undefined;
        await comment.save();
        const populated = await Comment.findById(comment._id).populate('author', 'firstName lastName role');
        res.send(populated);
    } catch (error) {
        res.status(500).send('Error updating comment');
    }
});

// Delete own comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).send('Comment not found');
        const isOwner = String(comment.author) === req.user._id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).send('Not allowed');
        await comment.deleteOne();
        res.send({ _id: comment._id, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).send('Error deleting comment');
    }
});

// Admin: list pending comments
router.get('/admin/comments/pending', auth, requireAdmin, async (req, res) => {
    try {
        const comments = await Comment.find({ isApproved: false, rejectionReason: { $in: [null, ''] } })
            .sort({ createdAt: -1 })
            .populate('author', 'firstName lastName role')
            .populate('course', 'title');
        res.send(comments);
    } catch (error) {
        res.status(500).send('Error fetching pending comments');
    }
});

// Admin: approve a comment
router.put('/admin/comments/:commentId/approve', auth, requireAdmin, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).send('Comment not found');
        comment.isApproved = true;
        comment.rejectionReason = undefined;
        await comment.save();
        res.send({ _id: comment._id, isApproved: comment.isApproved });
    } catch (error) {
        res.status(500).send('Error approving comment');
    }
});

// Admin: delete a comment
router.delete('/admin/comments/:commentId', auth, requireAdmin, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.commentId);
        if (!comment) return res.status(404).send('Comment not found');
        res.send({ _id: comment._id, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).send('Error deleting comment');
    }
});

// Admin: reject a comment with reason (soft reject)
router.put('/admin/comments/:commentId/reject', auth, requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) return res.status(400).send('Rejection reason is required');
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).send('Comment not found');
        comment.isApproved = false;
        comment.rejectionReason = reason.trim();
        await comment.save();
        res.send({ _id: comment._id, isApproved: comment.isApproved, rejectionReason: comment.rejectionReason });
    } catch (error) {
        res.status(500).send('Error rejecting comment');
    }
});

// Admin: list pending courses for approval
router.get('/admin/pending', auth, requireAdmin, async (req, res) => {
    try {
        const courses = await Course.find({ isApproved: false, rejectionReason: { $in: [null, ''] } })
            .populate('teacher', 'firstName lastName email');
        res.send(courses);
    } catch (error) {
        res.status(500).send('Error fetching pending courses.');
    }
});

// Admin: approve a course
router.put('/admin/:id/approve', auth, requireAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');
        course.isApproved = true;
        course.rejectionReason = undefined;
        await course.save();
        res.send({ _id: course._id, isApproved: course.isApproved });
    } catch (error) {
        res.status(500).send('Error approving course.');
    }
});

// Admin: reject a course with reason
router.put('/admin/:id/reject', auth, requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) return res.status(400).send('Rejection reason is required');
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found.');
        course.isApproved = false;
        course.rejectionReason = reason.trim();
        await course.save();
        res.send({ _id: course._id, isApproved: course.isApproved, rejectionReason: course.rejectionReason });
    } catch (error) {
        res.status(500).send('Error rejecting course.');
    }
});

module.exports = router;