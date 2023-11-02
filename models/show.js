const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
	userId: String,
	title: String,
	episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
});

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
