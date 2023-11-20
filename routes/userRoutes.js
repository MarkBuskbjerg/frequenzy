const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.get("/profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.render("profile.njk", { user, isAuthenticated: req.isAuthenticated() });
});

router.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.render("user/dashboard.njk", {
    user,
    isAuthenticated: req.isAuthenticated(),
  });
});

module.exports = router;
