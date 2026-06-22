const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // 🟢 Must match the name string you used when exporting your Product model
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 🟢 Must match the name string you used when exporting your User model
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create virtual "id" field to clean up frontend loops (matching your installer setup)
reviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

reviewSchema.set("toJSON", {
  virtuals: true,
});

// 🟢 Export matching standard destruction format keys
exports.Review = mongoose.model("Review", reviewSchema);
