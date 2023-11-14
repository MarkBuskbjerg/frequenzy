const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  showId: String,
  title: String,
  description: {
    type: String,
    default: "",
  },
  audioPath: String,
  publishDate: {
    type: Date,
    default: Date.now,
  },
});

const Episode = mongoose.model("Episode", episodeSchema);

module.exports = Episode;
