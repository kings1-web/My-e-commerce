const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { Request } = require("../models/request");

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const paystackHeaders = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

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

    const totalInKobo = Math.round(Number(amount) * 100);

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email.toLowerCase().trim(),
        amount: totalInKobo,
        callback_url: `http://localhost:5173/workspace/chat/${orderId}`,
        metadata: { orderId }, 
      },
      { headers: paystackHeaders }
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

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: paystackHeaders }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Transaction verification returned a non-success state.",
      });
    }

    const orderId = data.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId inside Paystack metadata parameters.",
      });
    }

    const contract = await Request.findById(orderId);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract request record missing in DB." });
    }

    // Fix: Compare directly in Kobo using Math.round to avoid float discrepancy errors
    const expectedKobo = Math.round(contract.priceQuote * 100);
    if (data.amount !== expectedKobo) {
      return res.status(400).json({
        success: false,
        message: "Transaction validation mismatch block. Financial values do not align.",
      });
    }

    // Protect against repeating this block if user refreshes frontend route
    if (contract.status !== "funded") {
      contract.status = "funded";
      contract.transactionRef = reference;
      contract.installerPayoutStatus = "pending"; 
      await contract.save();
    }

    return res.status(200).json({
      success: true,
      message: "Escrow milestone funded cleanly.",
      contract,
    });
  } catch (err) {
    console.error("❌ Verify Error:", err.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Verification execution failed." });
  }
});

// =====================================================
// 🎧 3. SECURE WEBHOOK (⚠️ RAW BODY HOOK NEEDED)
// =====================================================
// Note: Ensure your main server configuration uses express.raw() or passes 
// the raw buffer to req.rawBody for the webhook endpoint specifically.
router.post("/webhook", async (req, res) => {
  try {
    // Generate signature parsing the raw binary body data if saved into the request
    const payload = req.rawBody ? req.rawBody : JSON.stringify(req.body);
    
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("⚠️ Fraud Blocked: Request signature invalid!");
      return res.status(401).send("Unauthorized Webhook Source");
    }

    // Acknowledge immediately to avoid timeout retries from Paystack architecture
    res.status(200).send("Webhook Processed");

    const { event, data: paymentData } = req.body;

    if (event === "charge.success") {
      const orderId = paymentData.metadata?.orderId;
      if (orderId) {
        const contract = await Request.findById(orderId);
        // Protect against changing status if contract progressed beyond 'quoted'
        if (contract && contract.status === "quoted") {
          contract.status = "funded";
          contract.transactionRef = paymentData.reference;
          contract.installerPayoutStatus = "pending";
          await contract.save();
          console.log(`📡 [Webhook] Request ID ${orderId} updated to FUNDED.`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Background Webhook Fault:", err.message);
  }
});

// =====================================================
// 💸 4. PROXIED INSTALLER FUNDS DISBURSEMENT (Escrow Release)
// =====================================================
router.post("/orders/:orderId/payout-installer", async (req, res) => {
  try {
    const { orderId } = req.params;

    const contract = await Request.findById(orderId);
    if (!contract) {
      return res.status(404).json({ message: "Order records not discovered." });
    }

    if (contract.status !== "funded" || contract.installerPayoutStatus !== "pending") {
      return res.status(400).json({ message: "Funds are not in a valid escrow state to be paid out." });
    }

    // Assuming installer profile structure maps out bank details inside your order scheme
    // If not, fetch your Installer object mapping contract.installerId here
    const { bankCode, accountNumber, installerName } = contract.payoutDetails || {};

    if (!bankCode || !accountNumber) {
      return res.status(400).json({ message: "Installer profile lacks valid banking configuration." });
    }

    // Step A: Generate Transfer Recipient Token on Paystack Architecture
    const recipientResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: "nuban",
        name: installerName || "Installer Payout Account",
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      { headers: paystackHeaders }
    );

    const recipientCode = recipientResponse.data.data.recipient_code;

    // Step B: Initiate Transfer Route Execution via Paystack Balance Pool
    const payoutAmountKobo = Math.round(contract.priceQuote * 100);
    const transferResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: "balance",
        amount: payoutAmountKobo,
        recipient: recipientCode,
        reason: `Payout settlement allocation for Order Reference: ${orderId}`,
      },
      { headers: paystackHeaders }
    );

    // Update document system records
    contract.installerPayoutStatus = "completed";
    contract.status = "completed"; 
    await contract.save();

    return res.status(200).json({
      success: true,
      message: "Transfer processed cleanly via Paystack infrastructure Core.",
      data: transferResponse.data.data,
    });
  } catch (err) {
    console.error("❌ Payout Processing Error Exception:", err.response?.data || err.message);
    return res.status(500).json({
      message: err.response?.data?.message || "Failed to route manual wallet payout system.",
    });
  }
});

// =====================================================
// 🏦 5. PROXIED BANK CODES LOADER
// =====================================================
router.get("/banks", async (req, res) => {
  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: paystackHeaders,
    });
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Fetch Banks Fault:", err.message);
    return res.status(500).json({ message: "Failed to fetch active bank network lists." });
  }
});

module.exports = router;

