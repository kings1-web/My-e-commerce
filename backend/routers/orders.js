const { Order } = require("../models/order");
const axios =require('axios');
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
require("dotenv/config");
const baseURL="";




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
router.post('/', async (req, res) => {
  try {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (item) => {
        let productId;

        // Ensure the product ID is present
        if (typeof item.product === 'object' && item.product._id) {
          productId = item.product._id;
        } else if (item._id) {
          productId = item._id;
        } else {
          throw new Error("Missing product ID in order item");
        }

        const newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: productId,
        });

        return (await newOrderItem.save())._id;
      })
    );

    // Step 2: Calculate total price
    const totalPrices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate("product");

        if (!orderItem || !orderItem.product) {
          throw new Error("Order item or product not found");
        }

        return orderItem.product.price * orderItem.quantity;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    return res.json({
      success: true,
      orderItems: orderItemsIds,
      totalPrice: totalPrice,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Could not create order" });
  }
});

// Step 2: Verify Transaction (GET /api/v1/orders/verify/:ref)
router.get('/verify/:ref', async (req, res) => {
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

    if (data.status === "success") {
      const meta = data.metadata;

      // Create order using the metadata from Paystack
      const order = new Order({
        orderItems: meta.orderItems,
        shippingAddress1: meta.shipping.shippingAddress1,
        shippingAddress2: meta.shipping.shippingAddress2,
        city: meta.shipping.city,
        zip: meta.shipping.zip,
        country: meta.shipping.country,
        phone: meta.shipping.phone,
        status: "paid",  // Update the order status to "paid"
        totalPrice: meta.totalPrice,
        user: meta.user,
      });

      const savedOrder = await order.save();
      return res.json({ success: true, order: savedOrder });
    }

    res.status(400).json({ success: false, message: "Payment not successful" });
  } catch (err) {
    console.error("Verification failed:", err);
    res.status(500).json({ success: false, message: "Error verifying payment" });
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

    if (!userOrderList || userOrderList.length === 0) {
  return res.status(404).json({ success: false, message: 'No orders found' });
}


    res.status(200).send(userOrderList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/cod', async (req, res) => {
  try {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (item) => {
        const newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: item.product._id || item._id,
        });

        return (await newOrderItem.save())._id;
      })
    );

    const totalPrices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate("product");
        return orderItem.product.price * orderItem.quantity;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    const order = new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      user: req.body.user,
      totalPrice,
      status: "pending", // 👈 IMPORTANT (not paid yet)
    });

    const savedOrder = await order.save();

    res.json({ success: true, order: savedOrder });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "COD order failed" });
  }
});


module.exports = router;
