const mongoose = require("mongoose");


const requestSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  installer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Installer", 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product" 
  },
  address: { 
    type: String, 
    required: true 
  },
  priceQuote: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ["pending", "quoted", "funded", "completed", "disputed", "released"], 
    default: "pending" 
  },
  paymentIntentId: { 
    type: String, 
    default: "" 
  }
}, { timestamps: true });


requestSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

requestSchema.set("toJSON", {
  virtuals: true,
});



exports.Request = mongoose.model("Request", requestSchema);
exports.requestSchema = requestSchema;
