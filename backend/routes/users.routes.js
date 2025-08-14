const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const router = express.Router();

// Admin middleware helper
function requireAdmin(req, res, next) {
	if (req.user.role !== 'admin') return res.status(403).send('Access denied.');
	next();
}

router.post('/', async (req, res) => {
	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send('User already registered.');

	user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
		role: req.body.role,
		idNumber: req.body.idNumber,
		// Admins are auto-approved
		isApproved: req.body.role === 'admin'
	});

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);

	await user.save();

	const token = user.generateAuthToken();
	res.header('x-auth-token', token).send({
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role,
		isApproved: user.isApproved
	});
});

router.get('/enrolledCourses', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate('enrolledCourses');
		if (!user) {
			return res.status(404).send('User not found');
		}
		res.send(user.enrolledCourses);
	} catch (error) {
		res.status(500).send('Error fetching enrolled courses');
	}
});
router.get('/profile', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		if (!user) {
			return res.status(404).send('User not found');
		}
		res.send(user);
	} catch (error) {
		res.status(500).send('Error fetching user profile');
	}
});

// Update User Profile
router.put('/profile', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).send('User not found');
		}

		// modify fields
		user.firstName = req.body.firstName || user.firstName;
		user.lastName = req.body.lastName || user.lastName;
		user.email = req.body.email || user.email;
		user.idNumber = req.body.idNumber || user.idNumber;

		// hashing
		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(req.body.password, salt);
		}

		await user.save();

		// jodi pass na thake taile
		const updatedUser = await User.findById(user._id).select('-password');
		res.send(updatedUser);
	} catch (error) {
		res.status(500).send('Error updating user profile');
	}
});

// Admin: list users by approval status and role
router.get('/admin/users', auth, requireAdmin, async (req, res) => {
	try {
		const { status, role } = req.query; // status: pending|approved
		const filter = {};
		if (role) filter.role = role;
		if (status === 'pending') filter.isApproved = false;
		if (status === 'approved') filter.isApproved = true;
		const users = await User.find(filter).select('-password');
		res.send(users);
	} catch (error) {
		res.status(500).send('Error fetching users');
	}
});

// Admin: approve a user
router.put('/admin/users/:id/approve', auth, requireAdmin, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).send('User not found');
		user.isApproved = true;
		await user.save();
		res.send({ _id: user._id, isApproved: user.isApproved });
	} catch (error) {
		res.status(500).send('Error approving user');
	}
});

// Admin: update any user's profile
router.put('/admin/users/:id', auth, requireAdmin, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).send('User not found');
		user.firstName = req.body.firstName || user.firstName;
		user.lastName = req.body.lastName || user.lastName;
		user.email = req.body.email || user.email;
		user.role = req.body.role || user.role;
		if (typeof req.body.isApproved === 'boolean') user.isApproved = req.body.isApproved;
		user.idNumber = req.body.idNumber || user.idNumber;
		await user.save();
		const updatedUser = await User.findById(user._id).select('-password');
		res.send(updatedUser);
	} catch (error) {
		res.status(500).send('Error updating user');
	}
});

// Admin: reset any user's password
router.put('/admin/users/:id/reset-password', auth, requireAdmin, async (req, res) => {
	try {
		const { newPassword } = req.body;
		if (!newPassword || newPassword.length < 6) return res.status(400).send('Invalid new password.');
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).send('User not found');
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();
		res.send({ _id: user._id, message: 'Password reset successfully' });
	} catch (error) {
		res.status(500).send('Error resetting password');
	}
});

module.exports = router;
