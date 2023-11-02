const express = require('express');
const router = express.Router();
const Show = require('../models/show');
const Episode = require('../models/episode');
const { body, validationResult } = require('express-validator');
const upload = require('../multer.config');

router.get('/', (req, res) => {
	res.render('home.njk', { isAuthenticated: req.isAuthenticated() });
});

router.get('/privacy-first', (req, res) => {
	res.render('privacy-first.njk', { isAuthenticated: req.isAuthenticated() });
});

// Routes to create a new show
router.get('/create-show', (req, res) => {
	res.render('create-show.njk', { isAuthenticated: req.isAuthenticated() });
});

router.post('/create-show', [body('title').trim().escape()], upload.single('showImage'), async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(404).json({ errors: errors.array() });
	}

	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}

	const { title } = req.body;

	// Check if a file was uploaded
	if (!req.file) {
		return res.status(400).send('No file uploaded or file type is invalid.');
	}

	const newShow = new Show({
		userId: req.user.id,
		title: title,
		imageUrl: req.file.path.replace('public', ''),
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

	res.render('show.njk', { show, isAuthenticated: req.isAuthenticated() });
});

router.post('/delete-show/:showId', async (req, res) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}

	try {
		const show = await Show.findById(req.params.showId);
		// const show = await Show.findOne({ _id: req.params.showId });
		console.log(show);

		if (!show) {
			return res.status(404).send('Show not found');
		}

		if (show.userId.toString() !== req.user.id.toString()) {
			return res.status(403).send('Action was unauthorized'); // 403 is more apt for unauthorized actions
		}

		await show.delete();
		res.redirect('/my-shows');
	} catch (err) {
		// Handle specific error messages (if needed)
		if (err.name === 'CastError' && err.kind === 'ObjectId') {
			return res.status(400).send('Invalid Show ID');
		}

		console.error('Error processing the request:', err);
		return res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
