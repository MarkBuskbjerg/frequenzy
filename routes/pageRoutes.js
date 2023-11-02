const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('home.njk', { isAuthenticated: req.isAuthenticated() });
});

router.get('/privacy-first', (req, res) => {
	res.render('privacy-first.njk', { isAuthenticated: req.isAuthenticated() });
});

module.exports = router;
