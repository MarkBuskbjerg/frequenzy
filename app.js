const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
require('dotenv').config();
const app = express();
const flash = require('connect-flash');

//// require Routes
const authRoutes = require('./routes/authRoutes');
const showRoutes = require('./routes/showRoutes');

//// require MODELS
const User = require('./models/user');

// Require custom modules
const connectDB = require('./database');

// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(authRoutes);
app.use(showRoutes);

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ username: username });

			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}

			if (!bcrypt.compareSync(password, user.password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
	done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

// Set up Nunjucks as templating engine
nunjucks.configure('views', {
	autoescape: true,
	express: app,
	noCache: true, // only for dev mode
});

app.set('view engine', 'njk');

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
