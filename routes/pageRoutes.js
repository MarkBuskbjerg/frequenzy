const express = require("express");
const router = express.Router();

const pricingPlans = require("../utils/pricingPlans");

router.get("/", (req, res) => {
  res.render("home.njk", { isAuthenticated: req.isAuthenticated() });
});

router.get("/privacy-first", (req, res) => {
  res.render("privacy-first.njk", { isAuthenticated: req.isAuthenticated() });
});
router.get("/pricing", (req, res) => {
  res.render("pricing.njk", {
    isAuthenticated: req.isAuthenticated(),
    pricingPlans: pricingPlans,
  });
});

module.exports = router;
