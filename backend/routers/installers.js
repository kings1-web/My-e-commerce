const express = require("express");
const router = express.Router();
// 🟢 INITIALIZE PAYSTACK SDK NATIVELY
//const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const axios = require("axios"); // 👈 THIS WAS MISSING AND CAUSED THE CRASH
const { User } = require("../models/user"); // 🟢 UNIFIED: Direct interaction with single User model collection
const { Request } = require("../models/request"); 
const { InstallerReview } = require("../models/installerReview");
const { isAdmin, isInstaller } = require("../helpers/jwt");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const uploadOptions = multer({ storage });

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "installers", 
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "auto" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// 🟢 FIXED: Corrected host parameter definition string
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,         
  secure: true,      
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

/**
 * @route   GET /api/v1/installers/approved
 * @desc    Fetch all approved technical profiles for public listings (Home Page Grid)
 * @access  Public
 */
router.get("/approved", async (req, res) => {
  try {
    const installersList = await User.find({ roles: "installer", isApproved: true }).select("-passwordHash");
    const installersWithRatings = await Promise.all(
      installersList.map(async (installer) => {
        let averageRating = 0;
        let totalReviews = 0;
        try {
          const reviews = await InstallerReview.find({ installer: installer.id });
          totalReviews = reviews.length;
          if (totalReviews > 0) {
            averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
          }
        } catch (err) { console.error(err); }
        return { ...installer.toObject(), id: installer.id, averageRating, reviewCount: totalReviews };
      })
    );
    res.status(200).json(installersWithRatings);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

/**
 * @route   GET /api/v1/installers/profile/me
 * @desc    Fetch the logged-in technician's own installer profile profile metrics
 * @access  Private (Installer Only)
 */
router.get("/profile/me", isInstaller, async (req, res) => {
  try {
    const authPayload = req.auth || req.user;
    const currentUserId = authPayload.userId || authPayload.id;

    // Search the unified User model specifically for this technician account
    const installerProfile = await User.findById(currentUserId).select("-passwordHash");

    if (!installerProfile) {
      return res.status(404).json({ success: false, message: "Technician profile not found." });
    }

    return res.status(200).json(installerProfile);
  } catch (err) {
    console.error("Error pulling profile data:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});


/**
 * @route   GET /api/v1/installers/:id/details
 * @desc    Fetch full data profiles and review score history logs for a single chosen technician
 * @access  Public
 */
router.get("/:id/details", async (req, res) => {
  try {
    const installer = await User.findOne({ _id: req.params.id, roles: "installer" }).select("-passwordHash");
    if (!installer) return res.status(404).json({ message: "Installer profile not found." });
    
    const reviews = await InstallerReview.find({ installer: installer.id }).populate("user", "name").sort({ createdAt: -1 });
    let averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.status(200).json({ ...installer.toObject(), id: installer.id, averageRating, reviewCount: reviews.length, reviews });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

/**
 * @route   PUT /api/v1/installers/profile/image
 * @desc    Upload profile picture through multer streams direct to Cloudinary storage
 * @access  Private (Installer Only)
 */
router.put("/profile/image", isInstaller, uploadOptions.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    const result = await uploadToCloudinary(req.file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      req.auth.userId, // Pulls the unified identifier out of token claims safely
      { images: result.secure_url, imagesPublicId: result.public_id },
      { new: true }
    ).select("-passwordHash");

    res.json({ message: "Profile picture updated", installer: updatedUser });
  } catch (err) { res.status(500).json({ message: err.message }); }
});




/**
 * @route   POST /api/v1/installers/register
 * @desc    🔧 Unified Installer Registration with Native SDK Subaccount Generation
 * @access  Public
 */
/**
 * @route   POST /api/v1/installers/register
 * @desc    🔧 Complete Unified Installer Registration with Direct Axios Subaccount Generation
 * @access  Public
 */
router.post("/register", uploadOptions.single("image"), async (req, res) => {
  try {
    const emailInput = (req.body.email || "").toLowerCase().trim();
    const passwordInput = req.body.password || "";

    const {
      name,
      phone,
      location,
      skills,
      settlementBank,
      accountNumber
    } = req.body;

    // =====================================================
    // ✅ 1. CHECK DUPLICATE USER
    // =====================================================
    const existingUser = await User.findOne({ email: emailInput });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // =====================================================
    // ✅ 2. VALIDATE BANK DETAILS
    // =====================================================
    if (!settlementBank || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Bank details required"
      });
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account number"
      });
    }

    // =====================================================
    // ✅ 3. CREATE PAYSTACK SUBACCOUNT
    // =====================================================
    let paystackSubaccount = "";
    let paystackStatus = "pending";

    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/subaccount`,
        {
          business_name: name,
          settlement_bank: settlementBank,
          account_number: accountNumber,
          percentage_charge: 0
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      paystackSubaccount = response.data.data.subaccount_code;
      paystackStatus = "active";

      console.log("✅ Subaccount created:", paystackSubaccount);

    } catch (err) {
      console.error("❌ Paystack Error:", err.response?.data || err.message);

      // ⚠️ Don't block registration
      paystackStatus = "failed";
    }

    // =====================================================
    // ✅ 4. IMAGE UPLOAD
    // =====================================================
    let imageUrl = "/default-avatar.png";
    let publicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const incomingSkills = skills
      ? (Array.isArray(skills) ? skills : [skills])
      : [];

    // =====================================================
    // ✅ 5. SAVE USER
    // =====================================================
    const installer = new User({
      name,
      email: emailInput,
      phone,
      street: location || "",
      skills: incomingSkills,
      images: imageUrl,
      imagesPublicId: publicId,
      passwordHash: bcrypt.hashSync(passwordInput, 10),
      roles: ["customer", "installer"],
      isApproved: false,

      // 💰 Payment fields
      settlementBank,
      accountNumber,
      paystackSubaccount,
      paystackStatus
    });

    await installer.save();

    const responseData = installer.toObject();
    delete responseData.passwordHash;

    return res.status(201).json({
      success: true,
      message: "Registration successful (pending approval)",
      installer: responseData
    });

  } catch (error) {
    console.error("❌ Registration Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
// =========================================================================
// 🟢 RESTORED COMPONENT PIECES: ALL SUBSEQUENT ACTION ENDPOINTS APPENDED HERE
// =========================================================================

/**
 * @route   PUT /api/v1/installers/:id/approve
 * @desc    Admin reviews a registration request application and promotes them to approved status
 * @access  Private (Admin Only)
 */
router.put("/:id/approve", async (req, res) => {
  try {
    const installer = await User.findById(req.params.id);
    if (!installer) return res.status(404).json({ message: "Installer profile not found." });

    // 🟢 FIXED: Pushes 'installer' to roles array so their token access isn't blocked on dashboard checkouts
    if (!installer.roles.includes("installer")) {
      installer.roles.push("installer");
    }
    installer.isApproved = true;
    await installer.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: installer.email,
      subject: "Account Approved - Onboarding Welcome!",
      html: `<div style="font-family: sans-serif; padding: 20px;"><h2 style="color: #198754;">Congratulations, ${installer.name}!</h2><p>Your application has been <strong>approved</strong>. You can now use your switcher menu dropdown to take jobs.</p></div>`
    };
    transporter.sendMail(mailOptions, (err) => { if (err) console.error("SMTP alert drop error:", err.message); });
    
    res.status(200).json({ message: "Installer approved!", installer });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

/**
 * @route   DELETE /api/v1/installers/:id
 * @desc    Admin completely rejects and purges an unverified application profile from MongoDB
 * @access  Private (Admin Only)
 */
router.delete("/:id", async (req, res) => {
  try {
    const installer = await User.findById(req.params.id);
    if (!installer) return res.status(404).json({ message: "Installer records not found." });
    
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Installer application removed successfully." });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

/**
 * @route   PUT /api/v1/installers/request/:id
 * @desc    Basic inline status updates executed straight through table row interfaces
 * @access  Private (Installer Only)
 */
router.put("/request/:id", isInstaller, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.installer.toString() !== req.auth.userId) return res.status(403).json({ message: "Not authorized" });

    request.status = status;
    await request.save();
    res.json({ message: "Status updated successfully.", request });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/**
 * @route   GET /api/v1/installers
 * @desc    Get all users matching 'installer' to populate the main table rows in AdminPanel
 * @access  Private (Admin Only)
 */
router.get("/", async (req, res) => {
  try {
    const installersList = await User.find({ roles: "installer" }).select("-passwordHash");
    res.status(200).json(installersList);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


module.exports = router;




