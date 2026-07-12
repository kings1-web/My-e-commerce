const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
  shippingAddress1: String,
  shippingAddress2: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  phone: String,
  totalPrice: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "pending" },
  paymentReference: String,
  dateOrdered: {
    type: Date,
    default:Date.now
  },
  confirmationMessage: {
  type: String,
  default: ""
},
isConfirmed: {
  type: Boolean,
  default: false
}
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("Order", orderSchema);

/*
 order Example:
 {
 "orderItem":[
 {
 "quantity":3,
 "product":"67279c9638c36186d3935b33"
 },
{
 "quantity":2,
 "product": "67279c9638c36186d3935b33"
 }
 ],
 "shippingAddress1": "Flowers Street , 45",
 "shippingAddress2": "1-B",
 "city":"Prague",
 "zip":"00000",
 "country":"Czech Republic",
 "phone": "081456678865",
 "user":"67170c752a1fb5885db2a4c1"
 }
 */
