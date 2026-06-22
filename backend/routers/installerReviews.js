const express = require("express");
const router = express.Router();
const { InstallerReview } = require("../models/installerReview");

// ✅ POST: Submit a technician review
router.post("/", async (req, res) => {
  try {
    const { userId, installerId, rating, comment } = req.body;

    if (!userId || !installerId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required review inputs." });
    }

    const review = new InstallerReview({
      user: userId,
      installer: installerId,
      rating,
      comment: comment.trim()
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET: Fetch all reviews for a single installer
router.get("/installer/:installerId", async (req, res) => {
  try {
    const reviews = await InstallerReview.find({ installer: req.params.installerId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
