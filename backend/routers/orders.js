const { Order } = require("../models/order");
const axios =require('axios');
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
require("dotenv/config");
const baseURL="";

// ==========================================
// GOOGLE ANALYTICS HELPER FUNCTION
// ==========================================
const trackGAPurchase = async (clientId, orderId, totalPrice, currency = 'NGN') => {
  const measurementId = process.env.GA_MEASUREMENT_ID; // G-XXXXXXXXXX
  const apiSecret = process.env.GA_API_SECRET; // From GA admin console
  
  if (!measurementId || !apiSecret || !clientId) return;

  const url = `https://google-analytics.com{measurementId}&api_secret=${apiSecret}`;
  
  try {
    await axios.post(url, {
      client_id: clientId,
      events: [{
        name: 'purchase', // Standard GA4 e-commerce event
        params: {
          transaction_id: orderId.toString(),
          value: totalPrice,
          currency: currency,
          items: [] // Optional: Loop through order items if you populate products
        }
      }]
    });
    console.log(`GA4 purchase tracked for order: ${orderId}`);
  } catch (error) {
    console.error('GA Tracking Error:', error.response?.data || error.message);
  }
};

router.get("/", async (req, res) => {
  if (!req.auth.isAdmin) {
    return res.status(403).json({ message: "Admin only" });
  }

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ dateOrdered: -1 });

  res.send(orders);
});

router.get("/get/userorders", async (req, res) => {
  try {
    console.log("TOKEN USER:", req.auth.userId);

    const orders = await Order.find({
      user: req.auth.userId, // ✅ ALWAYS CORRECT
    })
      .populate("user", "name email")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: { path: "category", select: "name" },
        },
      })
      .sort({ dateOrdered: -1 });

    res.send(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  const orderList = await Order.find().populate('user','name email')
  .populate({
    path: 'orderItems', populate:{
      path:'product', populate:{path:'category',select:'name'}
    }
  })
  .sort({'dateOrdered':-1});

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .sort({ dateOrdered: -1 })
      .populate('user', 'name')
      .populate({
        path: 'OrderItems',
        populate: {
          path: 'product',
          populate: 'category',
        },
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.send(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// step 1:calculate total and create orderItem
router.post("/", async (req, res) => {
  try {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (item) => {
        const productId =
          item.product?._id || item.product || item._id;

        const newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: productId,
        });

        return (await newOrderItem.save())._id;
      })
    );

    // ✅ Calculate total from DB (SECURE)
    const totalPrices = await Promise.all(
      orderItemsIds.map(async (id) => {
        const item = await OrderItem.findById(id).populate("product");
        return item.product.price * item.quantity;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    // ✅ Create order (PENDING)
    const order = new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: "pending",
      totalPrice,
      user: req.auth.userId,
    });

    const savedOrder = await order.save();

    res.json({
      success: true,
      orderId: savedOrder._id,
      totalPrice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

router.get("/verify/:ref", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res
        .status(400)
        .json({ success: false, message: "Payment failed" });
    }

    const orderId = data.metadata.orderId;
     const gaClientId = data.metadata.gaClientId; // 👈 Extract client ID from metadata

    // ✅ Find existing order
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // ✅ Verify amount (SECURITY)
    const paidAmount = data.amount / 100;

    if (paidAmount !== order.totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
      });
    }

    // ✅ Update order
    order.status = "paid";
    order.transactionRef = req.params.ref;

    await order.save();

     // 🚀 TRACK TO GOOGLE ANALYTICS ONCE PAID SUCCESSFULLY
    if (gaClientId) {
      await trackGAPurchase(gaClientId, order._id, order.totalPrice, data.currency || 'NGN');
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Verification error",
    });
  }
});
 

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id, 
  {
    status:req.body.status
  },
  {new:true}
);
  if (!order)
    return res.status(404).send("the order cannot be created");
  res.send(order);
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then(async order => {
      if (order) {
        await Promise.all(
         order.orderItems.map(async orderItem => {
          await OrderItem.findByIdAndDelete(orderItem)
        })
      );
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: true, message: "order not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

   router.get('/get/totalsales', async (req, res)=>{
    const totalsales = await Order.aggregate([
      {$group:{_id:null,totalsales :{$sum: 'totalPrice'}}}
    ])
    if(!totalsales){
      return res.status(400).send('the order sales cannot be generated')
    }
    res.send({totalsales: totalsales.pop().totalsales})
   })

   router.get("/get/count", async (req, res) => {
    const orderCount = await Order.countDocuments();
  
    if (!orderCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      orderCount: orderCount,
    });
  });

  router.get("/get/userorders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const userOrderList = await Order.find({ user: userId })
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product',
          populate: 'category',
        },
      })
      .sort({ dateOrdered: -1 });

      // 🟢 OPTIMIZED: Return an empty array instead of throwing a scary 404 error
    if (!userOrderList || userOrderList.length === 0) {
      return res.status(200).json([]);
    }



    res.status(200).send(userOrderList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

 
 router.post("/cod", async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
   const { gaClientId } = req.body; // 👈 Extract client ID from payload
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (item) => {
        const productId =
          item.product?._id || item.product || item._id;

        const newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: productId,
        });

        return (await newOrderItem.save())._id;
      })
    );

    const totalPrices = await Promise.all(
      orderItemsIds.map(async (id) => {
        const orderItem = await OrderItem.findById(id).populate("product");
        return orderItem.product.price * orderItem.quantity;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    const order = new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      user: req.auth.userId,
      totalPrice,
      status: "Awaiting Confirmation", // 👈 NEW STATUS
      confirmationMessage: req.body.confirmationMessage, // 👈 from frontend
      isConfirmed: false,
    });

    const savedOrder = await order.save();


    // 🚀 TRACK COD TO GOOGLE ANALYTICS ON PLACEMENT
    if (gaClientId) {
      await trackGAPurchase(gaClientId, savedOrder._id, savedOrder.totalPrice, 'NGN');
    }

    res.json({
      success: true,
      message: "Order placed. Awaiting confirmation.",
      order: savedOrder,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});




module.exports = router;
