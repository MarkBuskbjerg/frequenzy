const mongoose = require('mongoose');
const categories = require('../utils/categories');
const languages = require('../utils/languages');
const timezones = require('../utils/timezones');

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
	showType: {
		type: String,
		enum: ['Episode', 'Serial'],
		default: 'Episode',
	},
	author: {
		type: String,
		default: '',
	},
	copyright: {
		type: String,
		default: '',
	},
	keywords: { type: String, default: '' },
	website: { type: String, default: '' },
	language: {
		type: String,
		required: true,
		enum: languages, // Validates that the language chosen is equal to a language defined in utils/languages.js
	},
	publishTimezone: {
		type: String,
		required: true,
		enum: timezones, // Validates that the timezone chosen is equal to a timezone defined in utils/timezones.js
	},
	showOwner: { type: String, default: '' },
	showOwnerEmail: { type: String, default: '' },
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
