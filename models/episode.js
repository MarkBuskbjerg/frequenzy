const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
	showId: String,
	title: String,
});

const Episode = mongoose.model('Episode', episodeSchema);

module.exports = Episode;
