const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { Request } = require("../models/request");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// =====================================================
// 💳 1. INITIALIZE PAYMENT (DASHBOARD DISPATCHER)
// =====================================================
router.post("/initialize", async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;

    if (!email || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing checkout parameters (email, amount, or orderId).",
      });
    }

    // Convert standard value cleanly to Kobo parameters
    const totalInKobo = Math.round(Number(amount) * 100);

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email.toLowerCase().trim(),
        amount: totalInKobo,
        callback_url: `http://localhost:5173/workspace/chat/${orderId}`,
        metadata: { orderId }, // Hidden payload maps back to DB during callbacks
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data.data);
  } catch (err) {
    console.error("❌ Initialize Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Secure payment handshake could not initialize.",
    });
  }
});

// =====================================================
// 🔍 2. VERIFY PAYMENT (FRONTEND ROUTE CATCHER)
// =====================================================
router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    console.log(`📡 [Verify API] Verifying payment reference token: ${reference}`);

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    // Reject route compilation if transaction returned failed
    if (data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Transaction verification returned a non-success state.",
      });
    }

    // Locate the order mapping references from custom metadata
    const orderId = data.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing structural tracking orderId inside Paystack metadata parameters.",
      });
    }

    const contract = await Request.findById(orderId);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract request record missing in DB." });
    }

    // Convert Kobo parameter metrics back to standard Naira units to verify values match
    const paidAmount = data.amount / 100;
    if (paidAmount !== contract.priceQuote) {
      return res.status(400).json({
        success: false,
        message: "Transaction validation mismatch block. Financial values do not align.",
      });
    }

    // 🟢 Shift milestone structure metrics cleanly to funded setup
    contract.status = "funded";
    contract.transactionRef = reference;
    contract.installerPayoutStatus = "pending"; // Held securely in escrow pool

    await contract.save();
    console.log(`✅ [Verify API] Request ID ${orderId} successfully shifted milestone to FUNDED.`);

    return res.status(200).json({
      success: true,
      message: "Escrow milestone funded cleanly. Tech workspace unlocked.",
      contract,
    });
  } catch (err) {
    console.error("❌ Verify Error Route Exception:", err.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Verification execution failed." });
  }
});

// =====================================================
// 🎧 3. SECURE WEBHOOK (BACKGROUND FALLBACK CHANNEL)
// =====================================================
router.post("/webhook", async (req, res) => {
  try {
    // 🔒 SECURE CRYPTOGRAPHIC CHECK: Ensures ONLY Paystack cloud nodes can dispatch requests here
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("⚠️ Fraud Blocked: Request signature invalid!");
      return res.status(401).send("Unauthorized Webhook Source");
    }

    // Respond back to Paystack server architecture right away with an OK state
    res.status(200).send("Webhook Processed");

    const event = req.body.event;
    const paymentData = req.body.data;

    // Handle background confirmations if a customer closes tabs prematurely
    if (event === "charge.success") {
      const orderId = paymentData.metadata?.orderId;
      
      if (orderId) {
        const contract = await Request.findById(orderId);
        
        // Only modify if it hasn't already been moved forward by the frontend verification hook
        if (contract && contract.status === "quoted") {
          contract.status = "funded";
          contract.transactionRef = paymentData.reference;
          contract.installerPayoutStatus = "pending";
          
          await contract.save();
          console.log(`📡 [Webhook Event] Background payment processing successfully updated Request ${orderId} to FUNDED.`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Background Webhook Runtime Fault:", err.message);
  }
});

// =====================================================
// 🏦 4. PROXIED BANK CODES LOADER (BYPASSES FRONTEND CORS)
// =====================================================
router.get("/banks", async (req, res) => {
  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Fetch Banks Fault:", err.message);
    return res.status(500).json({ message: "Failed to fetch active bank network lists." });
  }
});

module.exports = router;


