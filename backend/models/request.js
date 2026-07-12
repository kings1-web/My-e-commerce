const mongoose = require("mongoose");

const requestSchema = mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  installer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },

  address: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  // 💰 PRICING
  priceQuote: {
    type: Number,
    default: 0
  },

  platformFee: {
    type: Number,
    default: 0
  },

  // 🧠 CORE ESCROW STATUS
  status: {
    type: String,
    enum: [
      "pending",
      "quoted",
      "funded",
      "accepted",
      "in_progress",
      "completed",
      "released",
      "cancelled",
      "disputed"
    ],
    default: "pending"
  },

  // 🔒 ESCROW SAFETY
  escrowLocked: {
    type: Boolean,
    default: false
  },

  // 💬 DISPUTE SYSTEM
  dispute: {
    isOpen: { type: Boolean, default: false },
    reason: { type: String, default: "" },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolved: { type: Boolean, default: false },
    resolution: { type: String, default: "" },
    resolvedAt: Date
  },

  // 💸 REFUND SYSTEM
  refund: {
    reference: String,
    amount: Number,
    status: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none"
    },
    processedAt: Date
  },

  // 💳 PAYSTACK
  transactionRef: {
    type: String,
    default: null
  },

  paystackSubaccountUsed: {
    type: String,
    default: ""
  },

  // 💼 INSTALLER PAYOUT TRACKING
  installerPayoutStatus: {
    type: String,
    enum: ["none", "pending", "processing", "paid", "failed"],
    default: "none"
  }

},
{ timestamps: true }
);

// Virtual ID
requestSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

requestSchema.set("toJSON", { virtuals: true });

exports.Request = mongoose.model("Request", requestSchema);
