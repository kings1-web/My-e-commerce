const mongoose = require("mongoose");

const installerReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Customer writing the feedback
    required: true
  },
  installer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Installer", // The technician being reviewed
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
}, { timestamps: true });


installerReviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

installerReviewSchema.set("toJSON", {
  virtuals: true,
});

exports.installerReviewSchema=installerReviewSchema

exports.InstallerReview = mongoose.model("InstallerReview", installerReviewSchema);
