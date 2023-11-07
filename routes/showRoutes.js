const express = require('express');
const router = express.Router();
const Show = require('../models/show');
const Episode = require('../models/episode');
const { body, validationResult, param } = require('express-validator');
const { uploadSingle, uploadFields } = require('../multer.config');
const categories = require('../utils/categories');

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}
	next();
};

// Routes to create a new show
router.get('/create-show', ensureAuthenticated, (req, res) => {
	res.render('create-show.njk', {
		isAuthenticated: true,
		categories: categories,
	});
});

router.post(
	'/create-show',
	ensureAuthenticated,
	uploadSingle('image'),
	[body('title').trim().escape(), body('showDescription').trim().escape(), body('category').trim().isIn(categories).withMessage('Invalid category'), body('explicitContent').toBoolean()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(404).json({ errors: errors.array() });
		}

		const { title, showDescription, category } = req.body;
		let explicitContent = req.body.explicitContent === 'on' ? true : false; // Convert "on" to true and absence to false

		// Check if a file was uploaded
		if (!req.file) {
			return res.status(400).send('No file uploaded or file type is invalid.');
		}

		const newShow = new Show({
			userId: req.user.id,
			title: title,
			showDescription: showDescription,
			imageUrl: req.file.path.replace('public', ''),
			explicitContent: explicitContent,
			category: category,
		});
		await newShow.save();
		res.redirect('/my-shows');
	}
);

// Route to create a new episode
router.get('/create-episode/:showId', ensureAuthenticated, async (req, res) => {
	const { showId } = req.params;

	res.render('create-episode.njk', { isAuthenticated: true, showId });
});

router.post('/create-episode/:showId', uploadSingle('audio'), ensureAuthenticated, [param('showId').isMongoId().withMessage('Invalid show ID')], async (req, res) => {
	console.log('logging req param: ', req);
	const { title } = req.body;
	const showId = req.params.showId;
	const newEpisode = new Episode({
		showId: showId,
		title: title,
		audioPath: req.file.path.replace('public', ''),
	});

	await newEpisode.save();

	const show = await Show.findById(showId);
	show.episodes.push(newEpisode);
	await show.save();

	res.redirect(`/show/${showId}`);
});

// Route to view shows and episodes
router.get('/my-shows', ensureAuthenticated, async (req, res) => {
	const shows = await Show.find({ userId: req.user.id }).populate('episodes');
	res.render('my-shows.njk', { shows, isAuthenticated: true });
});

router.get('/show/:showId', ensureAuthenticated, [param('showId').isMongoId().withMessage('Invalid show ID')], async (req, res) => {
	const showId = req.params.showId;
	const show = await Show.findById(showId).populate('episodes');

	if (!show || show.userId.toString() !== req.user.id.toString()) {
		return res.status(404).send('Show not found or unauthorized');
	}

	res.render('show.njk', { show, isAuthenticated: true });
});

router.post('/delete-show/:showId', ensureAuthenticated, [param('showId').isMongoId().withMessage('Invalid show ID')], async (req, res) => {
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
