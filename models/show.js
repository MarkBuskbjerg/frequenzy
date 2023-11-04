const mongoose = require('mongoose');
const categories = require('../utils/categories');

const showSchema = new mongoose.Schema({
	userId: String,
	title: String,
	showDescription: {
		type: String,
		default: '',
	},
	imageUrl: {
		type: String,
		default: '',
	},
	explicitContent: {
		type: Boolean,
		default: false,
	},
	category: {
		type: String,
		required: true,
		enum: categories, // Validates that the category chosen is equal to a category defined in utils/categories.js
	},
	episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
});

showSchema.methods.delete = async function () {
	// First, delete all associated episodes
	if (this.model('Episode')) {
		await this.model('Episode').deleteMany({ showId: this._id });
	}

	// Then, delete the show itself
	await this.constructor.deleteOne({ _id: this._id });
};

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
