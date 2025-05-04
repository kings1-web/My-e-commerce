const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    }],
  shippingAddress1: {
    type: String,
    require: true,
  },
  shippingAdress2: {
    type: String,
  },
  city: {
    type: String,
    require: true,
  },
  zip: {
    type: String,
    require: true,
  },
  country: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
    default:"Pending",
  },
  totalPrice: {
    type: string,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default:Date.now
  },
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
