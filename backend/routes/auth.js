const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const router = express.Router();

router.post('/', async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send('Invalid email or password.');

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send('Invalid email or password.');

	// Prevent non-admin users from logging in before approval
	if (user.role !== 'admin' && !user.isApproved) {
		return res.status(403).send('Your account is pending admin approval.');
	}

	const token = user.generateAuthToken();
	res.send({ token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
});

module.exports = router;