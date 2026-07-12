const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @route   GET /api/v1/users
 * @desc    Fetch all users in the system, excluding passwords for safety
 */
router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
      return res.status(500).json({ success: false });
    }
    res.status(200).send(userList);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Fetch a single user profile record by its database ID context
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "The user with the given id was not found" });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/v1/users/ AND POST /api/v1/users/register
 * @desc    🟢 UNIFIED REGISTRATION: Processes all frontend signup formats with duplicate protection
 */
const handleUserRegistration = async (req, res) => {
  try {
    const emailInput = req.body.email || "";
    const passwordInput = req.body.password || "";

    // 1. REPLICATE UPWORK SAFETY: Prevent duplicate email registration collisions completely
    const existingUser = await User.findOne({ email: emailInput.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "This email address is already registered to an account. Please sign in or use a different email." 
      });
    }

    // 2. Build the model document with your address fields and default customer role parameters
    let user = new User({
      name: req.body.name,
      email: emailInput.toLowerCase().trim(),
      passwordHash: bcrypt.hashSync(passwordInput, 10), // Secure encryption block
      phone: req.body.phone,
      
      // 🟢 UNIFIED SYSTEM: Explicitly registers them with the baseline customer role array claim
      roles: ["customer"], 
      isAdmin: req.body.isAdmin || false,
      isApproved: false,

      // Your standard address attributes remain completely compatible
      street: req.body.street || "",
      apartment: req.body.apartment || "",
      zip: req.body.zip || "",
      city: req.body.city || "",
      country: req.body.country || ""
    });

    user = await user.save();
    
    if (!user) {
      return res.status(400).json({ success: false, message: "The user profile could not be initialized." });
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);

  } catch (err) {
    console.error("❌ Registration error block caught:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "An internal server fault error occurred while generating your user profile.", 
      error: err.message 
    });
  }
};

// Map both registration endpoints to the exact same robust function to fix front-end route redirects
router.post("/", handleUserRegistration);
router.post("/register", handleUserRegistration);

/**
 * @route   POST /api/v1/users/login
 * @desc    🟢 UPWORK ROLE LOGIN: Decrypts login parameters and packs role vectors into signed tokens
 */

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });

    if (!user) {
      return res.status(400).send("User not found");
    }

    if (!bcrypt.compareSync(req.body.password, user.passwordHash)) {
      return res.status(400).send("Wrong password");
    }

    const roles = Array.isArray(user.roles) ? user.roles : ["customer"];

    // 🟢 OPTIONAL BUT ENHANCED: Adding 'phone' to token signature payload parameters 
    const token = jwt.sign(
      {
        userId: user._id, 
        roles: roles,
        isAdmin: user.isAdmin,
        isApproved: user.isApproved,
        phone: user.phone // Attached directly to decrypted token claims matrix
      },
      process.env.secret,
      { expiresIn: "1d" }
    );

    // ✅ FIXED EXTENDED RESPONSE PAYLOAD
    res.send({
      user: user.email,
      token,
      roles,
      userId: user._id, 
      userDetails: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        phone: user.phone, // 🟢 FIXED: Passed smoothly down to frontend pinia authStore structures
        paystackSubaccount: user.paystackSubaccount || null
      }
    });

  } catch (err) {
    console.error("❌ Authentication gateway processing failure:", err.message);
    res.status(500).send("Internal authentication gateway issue.");
  }
});



/**
 * @route   GET /api/v1/users/get/count
 * @desc    Calculate and display total platform consumer counts inside Admin dashboards
 */
router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === undefined) {
      return res.status(500).json({ success: false });
    }
    res.status(200).send({ userCount: userCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Completely wipe an active user entity record from the database collection
 */
router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res.status(200).json({ success: true, message: "the user is deleted" });
      } else {
        return res.status(404).json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err.message });
    });
});

/**
 * @route   POST /api/v1/users/register/installer
 * @desc    🔧 Dedicated Installer Registration Portal with Paystack Subaccount Onboarding
 * @access  Public
 */

module.exports = router;
