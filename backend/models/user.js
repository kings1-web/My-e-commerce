const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  passwordHash: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  isAdmin: {
    type: Boolean,
    require: false,
  },
   // 🟢 UPWORK ROLE ARRAY SYSTEM: Replaces a strict true/false boolean flag
  roles: {
    type: [String],
    enum: ["customer", "installer", "admin"],
    default: ["customer"]
  },
  // 🟢 TECH INSTALLER METRICS: Nesting installer parameters on the same profile account
  isApproved: { type: Boolean, default: false },
  location: { type: String, default: "" },
  skills: { type: [String], default: [] },
  installerStatus: { type: String, default: "Active" },
  images: { type: String, default: "" },
  imagesPublicId: { type: String, default: "" },
  street: {
    type: String,
    default: "",
  },
  apartment: {
    type: String,
    default: "",
  },
  zip: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
