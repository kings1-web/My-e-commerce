const { Request } = require("../models/request");
// 🟢 FIXED: Import the User and Product models so Mongoose population works without throwing a 500 error!
const { User } = require("../models/user"); 
const { Product } = require("../models/product"); 
const { Installer } = require("../models/installer");
const express = require("express");
const router = express.Router();
const axios = require("axios"); // Ensure axios is imported at top of routers/Requests.js

const { isInstaller } = require("../helpers/jwt");

/**
 * @route   GET /api/v1/Requests/customer/:userId
 * @desc    Fetch all active installation records for a specific customer profile
 * @access  Private (Requires Customer Auth Token)
 */
router.get("/customer/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Safety validation boundary check
    if (!userId || userId === "undefined" || userId.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or missing 24-character Customer ObjectId format." 
      });
    }

    // 2. Query your MongoDB collection to extract active jobs for this user context
    const activeJobs = await Request.find({
      user: userId,
      status: { $ne: "released" } // 🟢 Upwork Filter: Exclude historically closed out records
    })
    .populate("installer", "name email phone location") // 🟢 Expands assigned technician profile details
    .populate("product", "name image price");          // 🟢 Joins the hardware product parameters

    // 3. Return the populated data dataset matrix cleanly back to Vue
    return res.status(200).json(activeJobs);

  } catch (err) {
    console.error("❌ Customer Dashboard lookup database failure:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server runtime fault occurred while parsing customer contract logs.",
      error: err.message 
    });
  }
});


/**
 * @route   GET /api/v1/Requests/check-installer-status/:installerId/:userId
 * @desc    Find active installation contracts linking a specific customer and installer ID
 * @access  Private (Requires Customer Auth Token)
 */
router.get("/check-installer-status/:installerId/:userId", async (req, res) => {
  try {
    // Searches database for incomplete contract assignments matching criteria parameters
    const activeMatch = await Request.findOne({
      installer: req.params.installerId,
      user: req.params.userId,
      status: { $ne: "released" } // Filters out archived finished assignments
    });

    return res.status(200).json(activeMatch);
  } catch (err) {
    return res.status(500).json({ message: "Failed to evaluate structural request status.", error: err.message });
  }
});


/**
 * @route   GET /api/v1/Requests/check-status/:productId/:userId
 * @desc    Find active installation contracts for a specific user and product combination
 * @access  Private (Requires Customer Auth Token)
 */
router.get("/check-status/:productId/:userId", async (req, res) => {
  try {
    // Queries your database to look for an active, incomplete assignment link match
    const activeContract = await Request.findOne({
      product: req.params.productId,
      user: req.params.userId,
      status: { $ne: "released" } // Ignore historically finished orders
    });

    // Returns the document payload object or null if it's a completely new buyer inquiry
    return res.status(200).json(activeContract);
  } catch (err) {
    return res.status(500).json({ message: "Failed to parse system request logs status profiles.", error: err.message });
  }
});


/**
 * @route   POST /api/v1/Requests/send-to-installer
 * @desc    Send an onboarding installation request to a single specific installer
 * @access  Private (Requires Customer Auth Token)
 */
router.post("/send-to-installer", async (req, res) => {
  try {
    const { userId, installerId, address, productId } = req.body;

    // 🟢 Step 1: Strict validation check to ensure no parameters drop blank
    if (!userId || !installerId || !address) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields. Please ensure user account, installer selection, and site address are provided." 
      });
    }

    // 🟢 Step 2: Instantiate the contract model document
    const singleRequest = new Request({
      user: userId,              // Customer database ID
      installer: installerId,    // Target technician's database ID
      product: productId || null, // Optional product item context link
      address: address.trim(),
      status: "pending"          // Defaults to pending until installer submits a price quote
    });

    // 🟢 Step 3: Save cleanly into your MongoDB collection
    await singleRequest.save();

    return res.status(201).json({
      success: true,
      message: "Installation request successfully dispatched to the technician's dashboard workspace panel!",
      request: singleRequest
    });

  } catch (err) {
    console.error("Single installer request failure:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error processing job request.", 
      error: err.message 
    });
  }
});


// ✅ CREATE REQUEST (USER)
// Fixed path from "/request" to "/" to align with frontend `${this.baseURL}Requests`
router.post("/", async (req, res) => {
  try {
    const { userId, installerId, product, address } = req.body;

    if (!userId || !installerId ) {
      return res.status(400).json({ message: "Missing required tracking parameters" });
    }

    const request = new Request({
      user: userId,
      installer: installerId,
      product:product || null,
      address,
      status: "pending",
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 2. Installer Submits Price Negotiation Quote
router.put("/:id/quote", async (req, res) => {
  try {
    const { priceQuote } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { priceQuote, status: "quoted" },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. User Funds Milestone Escrow (Simulating Paystack processing loop)
/**
 * @route   POST /api/v1/Requests/:id/fund
 * @desc    Verify payment transaction reference with Paystack and secure escrow milestone
 * @access  Private (Requires Customer Auth Token)
 */
router.post("/:id/fund", async (req, res) => {
  try {
    const { paymentIntentId } = req.body; // Paystack reference string mapping parameter keys

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "Missing tracking Paystack reference key." });
    }

    // 1. 🛡️ BACKEND PAYSTACK VERIFICATION AUDIT CHAIN (Upwork security level)
    // Query Paystack's transaction verification endpoint directly using your secret server key
    const paystackResponse = await axios.get(`https://paystack.co{paymentIntentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const paymentData = paystackResponse.data;

    // 2. Validate that the payment transaction actually reads successful inside their server logs
    if (!paymentData.status || paymentData.data.status !== "success") {
      return res.status(400).json({ 
        success: false, 
        message: "Fraud Blocked: Paystack reports this transaction reference code is invalid or uncompleted." 
      });
    }

    // Double-check the transaction value matches what is inside your database records
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Contract document records not found." });

    const expectedAmountInKobo = request.priceQuote * 100;
    if (paymentData.data.amount < expectedAmountInKobo) {
      return res.status(400).json({ success: false, message: "Security Block: Value mismatch. Amount paid is below quote requirements." });
    }

    // 3. Payment is 100% verified. Transition milestone flags inside MongoDB safely
    request.status = "funded";
    request.paymentIntentId = paymentIntentId;
    await request.save();

    return res.status(200).json({ 
      success: true, 
      message: "Escrow transaction audited perfectly. Milestone wallet funds locked inside platform vaults.", 
      request 
    });

  } catch (err) {
    console.error("Paystack system audit runtime exception failure:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Internal gateway verification failure transaction error.", 
      error: err.message 
    });
  }
});

// 4. User Releases Milestone Escrow Funds to Installer Wallet
router.put("/:id/release", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (request.status !== "funded") {
      return res.status(400).json({ message: "Only funded contracts can be released." });
    }
    request.status = "released";
    await request.save();
    res.json({ message: "Funds successfully released to technician.", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ INSTALLER GET THEIR REQUESTS
router.get("/requests", isInstaller, async (req, res) => {
  try {
    const requests = await Request.find({
      installer: req.auth.id,
    })
      .populate("user", "name email") // Fetches only name and email for safety
      .populate("product", "name image price");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET SINGLE REQUEST BY ID (Used by your contract dashboard milestone widget)
router.get("/:id", async (req, res) => {
  try {
    const requestItem = await Request.findById(req.params.id);
    if (!requestItem) {
      return res.status(404).json({ message: "Requested milestone contract layout file not found." });
    }
    res.status(200).json(requestItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// ✅ INSTALLER UPDATE STATUS
router.put("/request/:id", isInstaller, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.installer.toString() !== req.auth.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = req.body.status;
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

