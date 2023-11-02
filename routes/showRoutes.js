const express = require('express');
const router = express.Router();
const Show = require('../models/show');
const Episode = require('../models/episode');

router.get('/', (req, res) => {
	res.render('home.njk', { isAuthenticated: req.isAuthenticated() });
});

router.get('/create-show', (req, res) => {
	res.render('create-show.njk', { isAuthenticated: req.isAuthenticated() });
});

router.get('/privacy-first', (req, res) => {
	res.render('privacy-first.njk', { isAuthenticated: req.isAuthenticated() });
});

// Route to create a new show
router.post('/create-show', async (req, res) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}
	const { title } = req.body;
	const newShow = new Show({
		userId: req.user.id,
		title: title,
	});
	await newShow.save();
	res.redirect('/my-shows');
});

// Route to create a new episode
router.post('/create-episode/:showId', async (req, res) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}
	const { title } = req.body;
	const showId = req.params.showId;
	const newEpisode = new Episode({
		showId: showId,
		title: title,
	});
	await newEpisode.save();

	const show = await Show.findById(showId);
	show.episodes.push(newEpisode);
	await show.save();

	res.redirect('/');
});

// Route to view shows and episodes
router.get('/my-shows', async (req, res) => {
	res.locals.isAuthenticated = req.isAuthenticated();

	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}
	const shows = await Show.find({ userId: req.user.id }).populate('episodes');
	res.render('my-shows.njk', { shows });
});

router.get('/show/:showId', async (req, res) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}

	const showId = req.params.showId;
	const show = await Show.findById(showId).populate('episodes');

	if (!show || show.userId.toString() !== req.user.id.toString()) {
		return res.status(404).send('Show not found or unauthorized');
	}

	res.render('show.njk', { show });
});

module.exports = router;
