const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
	userId: String,
	title: String,
	imageUrl: {
		type: String,
		default: '',
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
