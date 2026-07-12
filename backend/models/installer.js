const mongoose = require("mongoose");

const installerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // ✅ Fixed typo from require to required
  },
  email: {
    type: String,
    required: true, // ✅ Fixed typo from require to required
    unique: true    // Prevents duplicate account emails
  },
  password: {
    type: String,
    required: true, // ✅ Fixed typo from require to required
  },
  phone: {
    type: String,
    required: true, // ✅ Fixed typo from require to required
  },
  images: { 
    type: String, 
    default: 'default-avatar.png' // Default placeholder value
  },
  imagesPublicId: {
    type: String,
    default: ''
  },
  // User Schema updates (add these fields to your existing schema)
settlementBank: {
   type: String,
   required:true 
  }, // Bank Code (e.g., '057')
  recipientCode: {
  type: String,
  default: ""
},
accountNumber: {
   type: String,
   required:true
  },
paystackSubaccount: {
   type: String,
   required:true 
  }, // Saved after Paystack onboarding
  location: {
    type: String,
    required: true, // ✅ Fixed typo from require to required
  },
  skills: [String], // e.g. ["CCTV", "Solar", "Electrical"]
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

installerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

installerSchema.set("toJSON", {
  virtuals: true,
});

exports.Installer = mongoose.model("Installer", installerSchema);
exports.installerSchema = installerSchema;

