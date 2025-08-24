const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/', async (req, res) => {
	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send('User already registered.');

	user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
		role: req.body.role
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
		role: user.role
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

module.exports = router;
