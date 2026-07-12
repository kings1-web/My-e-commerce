const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Request } = require("../models/request");
const { User } = require("../models/user"); 
const Installer = require("../models/installer"); // 🟢 ADD THIS: Forces Installer registration
const { Product } = require("../models/product"); 
const { isInstaller } = require("../helpers/jwt");
const axios = require("axios"); // Used for direct server-to-server Paystack auditing

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// 🟢 ADD THIS LINE: Initialize the official Paystack SDK package natively
//const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

// =========================================================================
// 🟢 ADMINISTRATIVE HUB: FETCH ALL SYSTEM INSTALLATION REQUESTS & MILESTONES
// =========================================================================
router.get("/", async (req, res) => {
  try {
    console.log("📡 [Admin API] Aggregating all platform installation requests...");

    // Find EVERY request document across the entire system database collection
    const allSystemRequests = await Request.find({})
      .populate({ path: "user", select: "name email phone" }) // Pull client profile indices
      .populate({ path: "installer", select: "name email phone location" }) // Pull technician profiles
      .populate({ path: "product", select: "name price image" }) // Pull referenced e-commerce hardware
      .sort({ createdAt: -1 }); // Order with newest entries first

    console.log(`✅ [Admin API] Discovered ${allSystemRequests.length} total request items mapped successfully.`);
    return res.status(200).json(allSystemRequests);

  } catch (err) {
    console.error("❌ Admin Request Retrieval Failure:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "An internal server fault error occurred while pulling your workspace contract assignments." 
    });
  }
});


// File Location: backend/routers/requests.js
router.get("/disputes", async (req, res) => {
  try {
    console.log("📡 [Admin API] Aggregating active installer milestone disputes...");
    
    // 🟢 OPTIMIZED: Query checks for true boolean values and handles fallback object searches
    const activeDisputesList = await Request.find({
      $or: [
        { "dispute.isOpen": true },
        { status: "disputed"}
      ]
    })
    .populate({ path: "user", select: "name email phone" })
    .populate({ path: "installer", select: "name email phone location" })
    .sort({ updatedAt: -1 });

    console.log(`✅ [Admin API] Discovered ${activeDisputesList.length} unresolved claims cases.`);
    return res.status(200).json(activeDisputesList);

  } catch (err) {
    console.error("❌ Disputes Fetch Failure:", err.message);
    return res.status(500).json({ success: false, message: "Server error aggregating disputes collection profile sets." });
  }
});



router.post("/send-to-installer", async (req, res) => {
  try {
    // 🟢 FIXED: Added 'phone' to the destructured body properties
    const { userId, installerId, address, phone, productId } = req.body;

    // 🟢 FIXED: Enforced a safety check to ensure phone numbers are present before saving
    if (!userId || !installerId || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: "User, Installer, Address, and Phone Number are required fields.",
      });
    }

    const request = new Request({
      user: userId,
      installer: installerId,
      product: productId || null,
      address: address.trim(),
      phone: phone.trim(), // 🟢 FIXED: Maps the required phone field directly into your Schema
      status: "pending",
      priceQuote: 0,       // Sets baseline numeric tracking pools safely
      installerPayoutStatus: "none"
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: "Request sent successfully",
      data: request,
    });
  } catch (err) {
    // This logs the exact error inside your terminal to keep things transparent during testing
    console.error("❌ Request Generation Crash Block:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// =========================================================================
// 🟢 2. CLIENT (USER) DASHBOARD: FETCH ALL OPEN JOBS FOR A CUSTOMER
// =========================================================================
router.get("/customer", async (req, res) => {
  try {
    console.log("AUTH DATA:", req.auth); // 👈 ADD THIS

    const userId = req.auth.userId;


    const activeJobs = await Request.find({
      user: userId,
      status: { $ne: "released" }
    })
    .populate("installer", "name email phone location")
    .populate("product", "name image price");

    res.status(200).json(activeJobs);
    console.log("Decoded auth:", req.auth);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

///** @route   GET /api/v1/requests/requests
 /* @desc    Fetch all requests assigned to the active installer
 */
router.get("/requests", isInstaller, async (req, res) => {
  try {
    const installerId = req.auth.userId;

    const requests = await Request.find({ installer: installerId })
      .populate("user", "name email phone")
      .populate("product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching requests",
      error: err.message
    });
  }
});

// =========================================================================
// 🟢 4. FETCH SINGLE CONTRACT REQUEST BY ID (Used by the Shared Chat Milestone Widget)
// =========================================================================
router.get("/:id", async (req, res) => {
  try {
    // 1. Fetch the request item from the database using the URL parameter ID
    const requestItem = await Request.findById(req.params.id);

    // 2. Safely check if the request item actually exists in your database
    if (!requestItem) {
      return res.status(404).json({ message: "Requested milestone contract layout file not found." });
    }

    // 3. Now that we know it exists, safely populate its relational references
    await Request.populate(requestItem, [
      { path: "user", select: "name email phone" },
      { path: "installer", select: "name email phone location" },
      { path: "product", select: "name image price" }
    ]);
    
    // 4. Return the fully populated document to your Vue frontend
    return res.status(200).json(requestItem);

  } catch (err) {
    console.error("Backend crash inside GET /:id route:", err); // Logs the real error to your terminal console
    return res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// 🟢 5. ESCROW STEP 1: INSTALLER SUBMITS NEGOTIATED PRICE QUOTE
// =========================================================================
router.put("/:id/quote", async (req, res) => {
  try {
    const { priceQuote } = req.body;

    // 1. Validation: Ensure the quote amount is provided and meets your minimum requirement
    if (!priceQuote || priceQuote <= 1000) {
      return res.status(400).json({ message: "Quote amount must be above ₦1,000." });
    }

    // 2. Fetch the target request from MongoDB first to evaluate its current state
    const currentRequest = await Request.findById(req.params.id);

    // 3. Prevent crash if the request ID doesn't exist at all
    if (!currentRequest) {
      return res.status(404).json({ message: "Installation request not found." });
    }

    // 4. Safe Status Check: Now you can safely check the status stored in the database
    if (currentRequest.status !== "accepted") {
      return res.status(400).json({
        message: "You must accept the job before sending a quote."
      });
    }

    // 5. If all checks pass, apply the updates securely
    currentRequest.priceQuote = priceQuote;
    currentRequest.status = "quoted";
    const updatedRequest = await currentRequest.save();

    // 6. Send the updated record back to your Vue frontend application
    return res.status(200).json(updatedRequest);

  } catch (err) {
    console.error("Error in PUT /:id/quote route:", err);
    return res.status(500).json({ message: err.message });
  }
});



// =========================================================================
// 🟢 6. ESCROW STEP 2: VERIFY PAYSTACK DEPOSIT & FUND MILESTONE VAULT
// =========================================================================
router.post("/:id/fund", async (req, res) => {
  try {
    const { paymentIntentId } = req.body; // Paystack reference key string passed from frontend

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "Missing tracking Paystack reference key." });
    }

    // 🛡️ Double Check Auditing Chain: Query Paystack api server directly to protect from fraud values
    const paystackResponse = await axios.get(`https://api.paystack.co/transaction/verify/${paymentIntentId}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    const paymentData = paystackResponse.data;

    if (!paymentData.status || paymentData.data.status !== "success") {
      return res.status(400).json({ success: false, message: "Paystack reports this transaction reference is uncompleted." });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Contract document not found." });

    // Paystack logs values in Kobo parameters (Naira * 100)
    const expectedAmountInKobo = request.priceQuote * 100;
    if (paymentData.data.amount < expectedAmountInKobo) {
      return res.status(400).json({ success: false, message: "Security Block: Paid value is lower than quote requirement." });
    }

    // Payment validated cleanly. Safely lock funds inside escrow status tag
    request.status = "funded";
    request.paymentIntentId = paymentIntentId;
    await request.save();

    return res.status(200).json({ success: true, message: "Milestone funds secured safely in platform escrow vaults.", request });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Paystack server lookup gateway error.", error: err.message });
  }
});

router.get("/verify-payment/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      // ✅ Update request in DB
      const updatedRequest = await Request.findOneAndUpdate(
        { paymentIntentId: reference },
        {
          status: "funded",
          paidAt: new Date(),
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Payment verified",
        request: updatedRequest,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
      });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

// =========================================================================
// 🟢 7. ESCROW STEP 3: CUSTOMER APPROVES JOB & RELEASES FUNDS TO WALLET BALANCE
// =========================================================================


 /**
 * @route   PUT /api/v1/requests/:id/release
 * @desc    💸 Admin Manual Escrow/Split Release Endpoint (Triggered from Dashboard)
 * @access  Private (Admin Only)
 */
router.put("/:id/release", async (req, res) => {
  try {
    const requestId = req.params.id;

    // 1. Structural Identity Guard: Check if the route parameter string is a valid Hex ID
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid contract request parameter identifier mapping." });
    }

    // 2. Fetch the target data out of MongoDB and populate the technician model indices
    const contract = await Request.findById(requestId).populate("installer");
    if (!contract) {
      return res.status(404).json({ success: false, message: "Requested installation contract record file not found." });
    }

    // 3. 🚨 SECURITY CORRECTION: Only allow release if work is marked 'completed' by the technician
    if (contract.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: `Payout Blocked: Contract status is currently '${contract.status}'. Work must be explicitly marked 'completed' by the installer before releasing escrow funds.`
      });
    }

    // 4. Double Payout Protection: Block repeated execution attempts
    if (contract.installerPayoutStatus === "paid") {
      return res.status(400).json({ success: false, message: "Escrow settlement funds have already been released for this project request." });
    }

    // =========================================================================
    // ✅ PIPELINE PATHWAY A: MODE IS SPLIT PAYMENT DIRECT CHANNELS
    // =========================================================================
    if (contract.paymentMode === "split") {
      contract.status = "released";
      contract.installerPayoutStatus = "paid";
      await contract.save();

      return res.status(200).json({
        success: true,
        message: "Marked complete (Split automated payment configuration already managed directly on platform transaction engines)."
      });
    }

    // =========================================================================
    // ✅ PIPELINE PATHWAY B: MODE IS SECURED ESCROW ACCUMULATION CHANNELS
    // =========================================================================
    if (contract.paymentMode === "escrow") {
      
      // Sandbox fallback route configuration if processing inside local test development environments
      if (process.env.NODE_ENV !== "production") {
        contract.status = "released";
        contract.installerPayoutStatus = "paid";
        await contract.save();

        return res.status(200).json({
          success: true,
          message: "Mock payout executed successfully (Sandbox environment dev mode bypassed wallet transfer constraints)."
        });
      }

      // REAL ESCROW LIVE DISBURSEMENT: Inspect the technician profile parameters
      const installer = contract.installer;
      if (!installer || !installer.settlementBank || !installer.accountNumber) {
        return res.status(400).json({
          success: false,
          message: "Payout Aborted: The assigned installer profile does not contain valid or complete bank settlement parameters."
        });
      }

      // Parse Naira numeric quotation cleanly to Kobo parameters integer parameters (Naira * 100)
      const transferAmountInKobo = Math.round(contract.priceQuote * 100);

      // STEP B1: Allocate routing token recipient metadata on Paystack network
      const recipientRes = await axios.post(
        `${PAYSTACK_BASE_URL}/transferrecipient`,
        {
          type: "nuban",
          name: installer.name,
          account_number: installer.accountNumber,
          bank_code: installer.settlementBank,
          currency: "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const recipientCode = recipientRes.data.data.recipient_code;

      // STEP B2: Dispatch real financial settlement out of business holding balance wallet straight into the recipient
      const transferRes = await axios.post(
        `${PAYSTACK_BASE_URL}/transfer`,
        {
          source: "balance", // Debits your platform's master Paystack balance
          amount: transferAmountInKobo,
          recipient: recipientCode,
          reason: `Escrow Release Settlement for Job Ref ID: ${contract._id}`,
          reference: `release_${contract._id}`, // 🛡️ IDEMPOTENCY KEY: Protects from dual wallet debit loops if timeout crashes occur
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const transferData = transferRes.data.data;

      // STEP B3: Update database system state properties securely
      contract.status = "released";
      contract.installerPayoutStatus = "paid";
      contract.transactionRef = transferData.reference; // Links tracking trace references cleanly

      await contract.save();
      console.log(`✅ [Escrow Release] Request ID ${requestId} successfully disbursed and closed.`);

      return res.status(200).json({
        success: true,
        message: "Escrow balance released successfully! Technician bank account credited.",
        contract,
      });
    }

  } catch (err) {
    console.error("❌ RELEASE OPERATION EXECUTION CRASH:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "An internal systems layout failure occurred during manual wallet disbursement syncing loops.",
      error: err.response?.data?.message || err.message,
    });
  }
});



/*router.put("/:id/release", async (req, res) => {
  try {
    const requestItem = await Request.findById(req.params.id)
      .populate("installer");

    if (!requestItem) return res.status(404).json({});

    // ✅ SPLIT MODE → NOTHING TO PAY
    if (requestItem.paymentMode === "split") {
      requestItem.status = "released";
      requestItem.installerPayoutStatus = "paid";

      await requestItem.save();

      return res.json({
        success: true,
        message: "Marked complete (split payment already settled)"
      });
    }

    // ✅ ESCROW MODE → PAYSTACK TRANSFER
    if (requestItem.paymentMode === "escrow") {

      // 🔒 fallback if transfer not allowed
      if (process.env.NODE_ENV !== "production") {
        requestItem.status = "released";
        requestItem.installerPayoutStatus = "paid";

        await requestItem.save();

        return res.json({
          success: true,
          message: "Mock payout (dev mode)"
        });
      }

      // REAL TRANSFER (same fixed version you already have)
    }

  } catch (err) {
    res.status(500).json({ message: "Release failed" });
  }
});*/



router.put("/:id/dispute", async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    // ✅ Validate input
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Dispute reason must be at least 5 characters"
      });
    }

    const requestItem = await Request.findById(id);

    if (!requestItem) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // ✅ Only allow dispute in valid stages
    if (!["in_progress", "completed"].includes(requestItem.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot open dispute at this stage"
      });
    }

    // ✅ Prevent duplicate dispute
    if (requestItem.dispute?.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Dispute already open"
      });
    }

    // ✅ Attach dispute
    requestItem.dispute = {
      isOpen: true,
      reason,
      openedBy: req.user?._id || null, // assuming auth middleware
      resolved: false,
      resolution: ""
    };

    // 🔒 Optional: freeze progress
    requestItem.status = "disputed";

    await requestItem.save();

    return res.status(200).json({
      success: true,
      message: "Dispute opened successfully",
      request: requestItem
    });

  } catch (err) {
    console.error("❌ DISPUTE ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to open dispute"
    });
  }
});

router.put("/:id/resolve-dispute", async (req, res) => {
  try {
    const { action } = req.body;

    // 🔒 ADMIN ONLY
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin only"
      });
    }

    const requestItem = await Request.findById(req.params.id)
      .populate("installer");

    if (!requestItem || !requestItem.dispute?.isOpen) {
      return res.status(400).json({
        success: false,
        message: "No active dispute"
      });
    }

    // =====================================================
    // OPTION 1: RELEASE TO INSTALLER
    // =====================================================
    if (action === "release") {
      // ⚠️ TODO: Add Paystack transfer here

      requestItem.status = "released";
      requestItem.installerPayoutStatus = "paid";

      requestItem.dispute.isOpen = false;
      requestItem.dispute.resolved = true;
      requestItem.dispute.resolution = "Released to installer";

      await requestItem.save();

      return res.json({
        success: true,
        message: "Dispute resolved: Installer paid"
      });
    }

    // =====================================================
    // OPTION 2: REFUND USER
    // =====================================================
    if (action === "refund") {

      // ❌ Prevent double refund
      if (requestItem.paymentStatus === "refunded") {
        return res.status(400).json({
          success: false,
          message: "Already refunded"
        });
      }

      const reference = requestItem.paymentReference;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: "No payment reference found"
        });
      }

      const axios = require("axios");

      const response = await axios.post(
        "https://api.paystack.co/refund",
        { transaction: reference },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.data.status) {
        throw new Error("Refund failed on Paystack");
      }

      // 💾 Update DB
      requestItem.status = "cancelled";
      requestItem.paymentStatus = "refunded";

      requestItem.dispute.isOpen = false;
      requestItem.dispute.resolved = true;
      requestItem.dispute.resolution = "Refunded to customer";

      requestItem.refund = {
        reference: response.data.data.transaction_reference,
        amount: response.data.data.amount,
        status: response.data.data.status,
        processedAt: new Date()
      };

      await requestItem.save();

      return res.json({
        success: true,
        message: "Dispute resolved: User refunded",
        refund: response.data.data
      });
    }

    // =====================================================
    // ❌ INVALID ACTION
    // =====================================================
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'refund' or 'release'"
    });

  } catch (err) {
    console.error("❌ RESOLVE DISPUTE ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to resolve dispute",
      error: err.response?.data || err.message
    });
  }
});






// =========================================================================
// 🟢 8. SYSTEM SYNC HELPERS: DETECT PROFILE STATUS CHECKS (Product Pages)
// =========================================================================
router.get("/check-status/:productId/:userId", async (req, res) => {
  try {
    const activeContract = await Request.findOne({
      product: req.params.productId,
      user: req.params.userId,
      status: { $ne: "released" }
    });
    return res.status(200).json(activeContract);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/check-installer-status/:installerId/:userId", async (req, res) => {
  try {
    const activeMatch = await Request.findOne({
      installer: req.params.installerId,
      user: req.params.userId,
      status: { $ne: "released" }
    });
    return res.status(200).json(activeMatch);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id/accept", isInstaller, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending jobs can be accepted" });
    }

    request.status = "accepted";
    await request.save();

    res.json({ message: "Job accepted", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/reject", isInstaller, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Job rejected", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/start", isInstaller, async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (request.status !== "funded") {
    return res.status(400).json({ message: "Job must be funded first" });
  }

  request.status = "in_progress";
  await request.save();

  res.json(request);
});

router.post("/payments/release/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate("installer");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!request.isPaidByUser) {
      return res.status(400).json({ message: "User has not paid" });
    }

    if (request.isPaidToInstaller) {
      return res.status(400).json({ message: "Already paid" });
    }

    // 💰 HERE you will call Paystack transfer API
    // send money to installer bank account

    request.isPaidToInstaller = true;
    request.status = "released";

    await request.save();

    res.json({ message: "Payment released to installer" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/complete", isInstaller, async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (request.status !== "in_progress") {
    return res.status(400).json({ message: "Job must be in progress" });
  }

  request.status = "completed";
  await request.save();

  res.json(request);
});

module.exports = router;



