const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // ⚙️ FIXED: Changed from 'require' to 'required'
  },
  email: {
    type: String,
    required: true,  // ⚙️ FIXED: Changed from 'require' to 'required'
    unique: true,    // 🛡️ CRITICAL: Prevents email registration account collisions
    lowercase: true, // Standardizes lookups
    trim: true
  },
  passwordHash: {
    type: String,
    required: true, // ⚙️ FIXED: Changed from 'require' to 'required'
  },
  phone: {
    type: String,
    required: true, // ⚙️ FIXED: Changed from 'require' to 'required'
  },
  isAdmin: {
    type: Boolean,
    default: false,
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
  
  // 🟢 PAYSTACK ROUTING DISBURSEMENT ATTRIBUTES: Added to store routing details securely
  settlementBank: {
    type: String,
    default: null // Saved as Paystack Bank Code string (e.g., '057' for Zenith Bank)
  },
  accountNumber: {
    type: String,
    default: null // 10-Digit NUBAN Account number
  },
  paystackSubaccount: {
    type: String,
    default: null // Generated subaccount token tracking key string (e.g., 'ACCT_xxxxxx')
  },

  /* 🛒 CUSTOMER / CORE ADDRESS ATTRIBUTES */
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
}, { timestamps: true }); // Automatically manages createdAt and updatedAt values

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
