const express = require("express");
const router = express.Router();
const { User } = require("../models/user"); 
const { Request } = require("../models/request"); 
const { InstallerReview } = require("../models/installerReview");
const { isAdmin, isInstaller } = require("../helpers/jwt");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

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

const transporter = nodemailer.createTransport({
  host: "://gmail.com",
  port: 465,         
  secure: true,      
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// GET APPROVED INSTALLERS DIRECTORY (Public Home Directory Page)
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

// GET INDIVIDUAL TECHNICIAN COMPLETE WORKSPACE LOG DETAILS (Profile Page)
router.get("/:id/details", async (req, res) => {
  try {
    const installer = await User.findOne({ _id: req.params.id, roles: "installer" }).select("-passwordHash");
    if (!installer) return res.status(404).json({ message: "Installer profile not found." });
    
    const reviews = await InstallerReview.find({ installer: installer.id }).populate("user", "name").sort({ createdAt: -1 });
    let averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.status(200).json({ ...installer.toObject(), id: installer.id, averageRating, reviewCount: reviews.length, reviews });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// MULTIPART FORM MULTER DISPATCH: SAVES AVATAR PIC DIRECTLY TO CLOUDINARY REPOSITORY
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

// INSTALLER APPLICATION SIGNUP PORTAL GATEWAY
router.post("/register", uploadOptions.single("image"), async (req, res) => {
  try {
    const { name, email, password, phone, location, skills } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered on this platform." });

    let imageUrl = '/default-avatar.png';
    let publicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    let incomingSkills = skills ? (Array.isArray(skills) ? skills : [skills]) : [];
    
    let installerProfile = new User({
      name, email, phone, location, skills: incomingSkills, images: imageUrl, imagesPublicId: publicId,
      passwordHash: bcrypt.hashSync(password, 10),
      roles: ["customer", "installer"], // 🟢 Auto assigns dual capabilities natively
      isApproved: false
    });

    await installerProfile.save();
    res.status(201).json({ message: "Application submitted successfully!", installer: installerProfile });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// LEGACY COMPATIBLE FREELANCER ENTRY PORTAL LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !user.roles.includes("installer")) return res.status(400).send("Installer profile not found");
    if (!bcrypt.compareSync(req.body.password, user.passwordHash)) return res.status(400).send("Wrong password");

    const token = jwt.sign({ userId: user.id, roles: user.roles, isAdmin: user.isAdmin }, process.env.secret, { algorithm: "HS256" });
    res.status(200).send({ installer: user, token });
  } catch (err) { res.status(500).send("Server authentication login failure."); }
});

// ADMIN PROMOTES/APPROVES NEW TECHNICIAN PORTFOLIO APPLICATIONS
router.put("/:id/approve", isAdmin, async (req, res) => {
  try {
    const installer = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).select("-passwordHash");
    if (!installer) return res.status(404).json({ message: "Installer profile not found." });

    const mailOptions = {
      from: process.env.EMAIL_USER, to: installer.email,
      subject: "Account Approved - Onboarding Welcome!",
      html: `<div style="font-family: sans-serif; padding: 20px;"><h2 style="color: #198754;">Congratulations, ${installer.name}!</h2><p>Your application has been <strong>approved</strong>. You can now log into your dashboard to take jobs.</p></div>`
    };
    transporter.sendMail(mailOptions, (err) => { if (err) console.error(err); });
    res.status(200).json({ message: "Installer approved!", installer });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// ADMIN TOTALLY WIPES PROFILE SUBMISSIONS FROM SYSTEM DATABASES
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const installer = await User.findById(req.params.id);
    if (!installer) return res.status(404).json({ message: "Installer records not found." });
    
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Installer application removed successfully." });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// INLINE TABLE ROW SYSTEM STATUS UPDATER 
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

// GET ADMIN INVENTORY MANAGER RECORD MATRIX LOOKUPS
router.get("/", async (req, res) => {
  try {
    const installersList = await User.find({ roles: "installer" }).select("-passwordHash");
    res.json(installersList);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;



