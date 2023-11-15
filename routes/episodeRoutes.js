const express = require("express");
const router = express.Router();
const Show = require("../models/show");
const Episode = require("../models/episode");
const { body, validationResult, param } = require("express-validator");
const { uploadSingle, uploadFields } = require("../multer.config");
const categories = require("../utils/categories");
const languages = require("../utils/languages");
const timezones = require("../utils/timezones");

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
};

// Route to create a new episode
router.get("/create-episode/:showId", ensureAuthenticated, async (req, res) => {
  const { showId } = req.params;

  res.render("create-episode.njk", { isAuthenticated: true, showId });
});

router.post(
  "/create-episode/:showId",
  uploadSingle("audio"),
  ensureAuthenticated,
  [param("showId").isMongoId().withMessage("Invalid show ID")],
  async (req, res) => {
    console.log(req.body);
    const { title, description, publishDate } = req.body;
    const showId = req.params.showId;
    const newEpisode = new Episode({
      showId: showId,
      title: title,
      description: description,
      publishDate: publishDate ? new Date(publishDate) : undefined,
      audioPath: req.file.path.replace("public", ""),
    });

    await newEpisode.save();

    const show = await Show.findById(showId);
    show.episodes.push(newEpisode);
    await show.save();

    res.redirect(`/show/${showId}`);
  }
);

// Route to handle episode deletion
router.post(
  "/delete-episode/:episodeId",
  ensureAuthenticated,
  async (req, res) => {
    const { episodeId } = req.params;

    try {
      // Find the episode
      const episode = await Episode.findById(episodeId).populate("showId");
      if (!episode) {
        return res.status(404).send("Episode not found.");
      }

      // Find the parent show to check for the correct user
      const show = await Show.findById(episode.showId);
      if (!show) {
        return res.status(404).send("Show not found.");
      }

      // Check if the logged-in user is authorized to delete the episode
      if (req.user.id !== show.userId) {
        return res.status(403).send("Not authorized to delete this episode.");
      }

      // Delete the episode
      await Episode.deleteOne({ _id: episodeId });

      // Redirect to the show's page or a list of episodes
      res.redirect("/show/" + show._id);
    } catch (error) {
      console.error("Error deleting episode:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
