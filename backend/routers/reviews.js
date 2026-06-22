const { Review } = require("../models/review");
const express = require("express");
const router = express.Router();
// 🟢 FIXED: Imported mongoose so your database aggregation tools work without crashing
const mongoose = require("mongoose"); 

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review for a physical product
 */
router.post("/", async (req, res) => {
  try {
    const { product, userId, rating, comment } = req.body;

    // Validate incoming parameters
    if (!product || !rating || !comment) {
      return res.status(400).json({ message: "Missing required product, rating, or comment parameters." });
    }

    const review = new Review({
      product: product,        // Maps to Product collection reference
      user: userId,            // Maps to User collection reference
      rating: Number(rating),
      comment: comment.trim()
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error("Mongoose Review Save Crash:", err.message);
    res.status(500).json({ message: "Database validation casting error.", error: err.message });
  }
});

/**
 * @route   GET /api/v1/reviews/product/:productId
 * @desc    🟢 FIXED: Correctly fetches all reviews matching a specific product ID
 */
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 }); // Newest reviews first

    res.status(200).send(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/v1/reviews/average/:productId
 * @desc    🟢 FIXED: Calculates the accurate mathematical average rating for a single item
 */
router.get("/average/:productId", async (req, res) => {
  try {
    // Safety check: verify parameter matches 24-character ObjectId pattern bounds
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: "Invalid Product ID layout format." });
    }

    const result = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    res.status(200).send(result[0] || { avgRating: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

