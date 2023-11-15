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

// Routes to create a new show
router.get("/create-show", ensureAuthenticated, (req, res) => {
  res.render("show/create.njk", {
    isAuthenticated: true,
    categories: categories,
    timezones: timezones,
    languages: languages,
  });
});

router.post(
  "/create-show",
  ensureAuthenticated,
  uploadSingle("image"),
  [
    body("title").trim().escape(),
    body("showDescription").trim().escape(),
    body("category").trim().isIn(categories).withMessage("Invalid category"),
    body("explicitContent").toBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }

    const {
      title,
      showDescription,
      category,
      showType,
      author,
      copyright,
      keywords,
      website,
      language,
      publishTimezone,
      showOwner,
      showOwnerEmail,
    } = req.body;
    let explicitContent = req.body.explicitContent === "on" ? true : false; // Convert "on" to true and absence to false

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded or file type is invalid.");
    }

    const newShow = new Show({
      userId: req.user.id,
      title: title,
      showDescription: showDescription,
      imageUrl: req.file.path.replace("public", ""),
      explicitContent: explicitContent,
      category: category,
      showType: showType,
      author: author,
      copyright: copyright,
      keywords: keywords,
      website: website,
      language: language,
      publishTimezone: publishTimezone,
      showOwner: showOwner,
      showOwnerEmail: showOwnerEmail,
    });
    await newShow.save();
    res.redirect("/my-shows");
  }
);

router.post(
  "/save-show/:showId",
  ensureAuthenticated,
  uploadSingle("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Fetch the show to update
      const show = await Show.findById(req.params.showId);
      if (!show) {
        return res.status(404).send("Show not found.");
      }

      // Check if the logged-in user is authorized to edit the show
      if (req.user.id !== show.userId) {
        return res.status(403).send("Not authorized to edit this show.");
      }

      // Update show properties
      const { title, showDescription, category } = req.body;
      const explicitContent = req.body.explicitContent ? true : false; // This depends on how the checkbox value is sent in the form

      show.title = title;
      show.showDescription = showDescription;
      show.category = category;
      show.explicitContent = explicitContent;

      // Handle the uploaded image file if there is one
      if (req.file) {
        // Update the imageUrl to the path of the new image
        show.imageUrl = req.file.path;
      }

      // Save the updated show to the database
      await show.save();

      // Redirect to the updated show's page or send a success response
      res.redirect("/show/" + show._id);
    } catch (error) {
      console.error("Error saving show:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// This route could possibly be deleted
router.post(
  "/edit-show-description/:showId",
  ensureAuthenticated,
  async (req, res) => {
    const { showId } = req.params;
    const { showDescription } = req.body; // Grab the new description from the form

    try {
      // Find the show by ID
      const show = await Show.findById(showId);
      if (!show) {
        return res.status(404).send("Show not found.");
      }

      // Check if the logged-in user is authorized to edit the show
      if (req.user.id !== show.userId) {
        return res.status(403).send("Not authorized to edit this show.");
      }

      // Update the show description
      show.showDescription = showDescription;
      await show.save();

      // Redirect back to the show's page
      res.redirect("/show/" + showId);
    } catch (error) {
      console.error("Error updating show description:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route to view shows and episodes
router.get("/my-shows", ensureAuthenticated, async (req, res) => {
  const shows = await Show.find({ userId: req.user.id }).populate("episodes");
  res.render("show/my-shows.njk", { shows, isAuthenticated: true });
});

router.get(
  "/show/:showId",
  ensureAuthenticated,
  [param("showId").isMongoId().withMessage("Invalid show ID")],
  async (req, res) => {
    const showId = req.params.showId;
    const show = await Show.findById(showId).populate("episodes");

    if (!show || show.userId.toString() !== req.user.id.toString()) {
      return res.status(404).send("Show not found or unauthorized");
    }

    res.render("show/overview.njk", { show, showId, isAuthenticated: true });
  }
);

router.get("/show/:showId/settings", ensureAuthenticated, async (req, res) => {
  const showId = req.params.showId;
  const show = await Show.findById(showId);

  if (!show || show.userId.toString() !== req.user.id.toString()) {
    return res.status(404).send("Show not found or unauthorized");
  }

  res.render("show/settings.njk", {
    show,
    isAuthenticated: true,
    showId,
    categories: categories,
    languages: languages,
    timezones: timezones,
  });
});

// Route to the distribution settings for the podcast show
router.get(
  "/show/:showId/distribution",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const showId = req.params.showId;
      const show = await Show.findById(showId).populate("episodes");

      if (!show) {
        return req
          .status(404)
          .send("No episodes found for this show ... yet 😎");
      }

      res.render("show/distribution.njk", {
        show: show,
        showId: showId,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error fetching distribution: ", error);
      res.status(500).send("Internal server error");
    }
  }
);

// Route to the distribution settings for the podcast show
router.get(
  "/show/:showId/distribution/website",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const showId = req.params.showId;
      const show = await Show.findById(showId).populate("episodes");

      if (!show) {
        return req
          .status(404)
          .send("No episodes found for this show ... yet 😎");
      }

      res.render("show/distribution-website.njk", {
        show: show,
        showId: showId,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error fetching distribution: ", error);
      res.status(500).send("Internal server error");
    }
  }
);

// Route to the distribution settings for the podcast show
router.get(
  "/show/:showId/distribution/embed-player",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const showId = req.params.showId;
      const show = await Show.findById(showId).populate("episodes");

      if (!show) {
        return req
          .status(404)
          .send("No episodes found for this show ... yet 😎");
      }

      res.render("show/distribution-embedplayer.njk", {
        show: show,
        showId: showId,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error fetching embeddable player: ", error);
      res.status(500).send("Internal server error");
    }
  }
);

// Route to the distribution settings for the podcast show
router.get(
  "/show/:showId/distribution/podcast-apps",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const showId = req.params.showId;
      const show = await Show.findById(showId).populate("episodes");

      if (!show) {
        return req
          .status(404)
          .send("No episodes found for this show ... yet 😎");
      }

      res.render("show/distribution-apps.njk", {
        show: show,
        showId: showId,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error fetching embeddable player: ", error);
      res.status(500).send("Internal server error");
    }
  }
);

// Route to show a list of all episodes
router.get("/show/:showId/episodes/", ensureAuthenticated, async (req, res) => {
  // Somehow this oes not pass anything that shows on the template list ... though the episodes clearly exist in log .. .sctracthes the head

  try {
    const showId = req.params.showId;
    const episodes = await Episode.find({ show: showId });
    const show = await Show.findById(showId).populate("episodes");

    if (!show) {
      return req.status(404).send("No episodes found for this show ... yet 😎");
    }

    res.render("episodesList.njk", {
      episodes: episodes,
      show: show,
      showId: showId,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error fetching episodes: ", error);
    res.status(500).send("Internal server error");
  }
});

// Route to display a single episode
router.get(
  "/show/:showId/episodes/:episodeId",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const episodeId = req.params.episodeId;
      const episode = await Episode.findById(episodeId);

      if (!episode) {
        return res.status(404).send("Episode not found.");
      }

      res.render("episode.njk", { episode: episode, showId: showId });
    } catch (error) {
      console.error("Error fetching episode:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post(
  "/delete-show/:showId",
  ensureAuthenticated,
  [param("showId").isMongoId().withMessage("Invalid show ID")],
  async (req, res) => {
    try {
      const show = await Show.findById(req.params.showId);

      if (!show) {
        return res.status(404).send("Show not found");
      }

      if (show.userId.toString() !== req.user.id.toString()) {
        return res.status(403).send("Action was unauthorized"); // 403 is more apt for unauthorized actions
      }

      await show.delete();
      res.redirect("/my-shows");
    } catch (err) {
      // Handle specific error messages (if needed)
      if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(400).send("Invalid Show ID");
      }

      console.error("Error processing the request:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/rss/:showId", async (req, res) => {
  const { showId } = req.params;
  const show = await Show.findById(showId).populate("episodes");
  console.log(show);
  res.type("application/rss+xml");
  res.render("publicRSS.njk", { show, showId });
});

module.exports = router;
