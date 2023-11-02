const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// Routes for logging in users
router.get('/login', (req, res) => {
	const errorMessages = req.flash('error');
	res.render('login.njk', {
		isAuthenticated: req.isAuthenticated(),
	});
});

// POST route for login
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/', // Redirect to the home page on successful login
		failureRedirect: '/login', // Redirect back to the login page on failed login
		failureFlash: true, // Enable flash messages for failed login attempts
	})
);

// Routes for signing up users
router.get('/signup', (req, res) => {
	res.render('signup.njk', { isAuthenticated: req.isAuthenticated() });
});

router.post('/signup', async (req, res) => {
	const { username, password } = req.body;

	try {
		// Check if the username already exists in the database
		const existingUser = await User.findOne({ username: username });

		if (existingUser) {
			return res.status(400).send('Username already exists. Choose a different one.');
		}

		// Hash the password before saving it to the database
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user document
		const newUser = new User({
			username: username,
			password: hashedPassword,
		});

		// Save the new user to the database
		await newUser.save();

		// Redirect to a success page or login page
		res.redirect('/login');
	} catch (err) {
		console.error(err);
		return res.status(500).send('Error during signup process.');
	}
});

// Routes for loggin out users
router.get('/logout', (req, res) => {
	req.logout(function (error) {
		if (error) {
			return next(error);
		}
		res.redirect('/');
	});
});

// Export the router
module.exports = router;
