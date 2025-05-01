const { Order } = require("../models/order");
const axios =require('axios');
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
require("dotenv/config");
//const Stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
//const baseURL="http://localhost:5173"
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
  const order = await Order.findById(req.params.id).sort({'dateOrdered':-1})
  .populate('user', 'name')
  .populate({
    path: 'OrderItems', populate:{
      path:'product', populate: 'category'}
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
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

  router.get("/get/userorders/:userid", async (req, res) => {
    const userid = req.params.userid;
   // console.log('user id:', userid)
    const userOrderList = await Order.find({user:userid}).populate({
      path:'orderItems',
       populate:{
        path:'product',
        populate: 'category'
        }
      }).sort({'dateOrdered':-1});
      console.log('user order:', userOrderList)
  
    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.status(200).send(userOrderList);
  });

 /* router.post('/create-checkout-session', async(req, res, next)=>{
    const items = req.body.items;
console.log('Items:',items)

    const address = req.body.address;
console.log('Address:',address)
    

    const lineItems = items.map((item)=>({
      price_data:{
        currency:'NGN',
        product_data:{
          name:item.name,
         // images:[item.images],
        },
        unit_amount:item.unit_price*100,
      },
      quantity:item.quantity,
    }))
    Stripe.checkout.sessions.create({
    payment_method_types:['card'],
    line_items:lineItems,
    mode:'payment',
    success_url:'https://kings-ecommerce.onrender.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url:'https://kings-ecommerce.onrender.com/payment/failure',
     metadata:{
      items:JSON.stringify(items),
      address:JSON.stringify(address)
     }
    }).then((session)=>res.json({sessionId:session.id, url:session.url}))
    .catch(error=>{
     console.error(error);
     res.status(500).json({message: 'Stripe session failed'});
    });
    })*/
    
  /* const orderItemIds = Promise.all(items.map(async(item)=>{
      const newOrderItem = new OrderItem({
        quantity: item.quantity,
        product:item.id
      });
      //const savedItem = await newOrderItem.save()
     // return savedItem.id;
    }))
   const orderItemsIdsResolved = await orderItemIds;

    const totalPrices =await Promise.all(orderItemsIdsResolved.map(async(_id)=>{
      const orderItem = await OrderItem.findById(_id).populate('product', 'price');
      return orderItem.product.price * orderItem.quantity;
    }));
    console.log('price1:',totalPrices)

    const totalPrice = totalPrices.reduce((acc, val)=> acc + val, 0)
    console.log('price:',totalPrice)

    let order = new Order({
      orderItems:orderItemsIdsResolved,
      shippingAddress1:address.shippingAddress1,
      shippingAddress2:address.shippingAddress2 || '',
      city:address.city,
      zip:address.zip,
      country:address.country,
      phone:address.phone,
      user:address.userId,
      totalPrice:totalPrice,
      status:'pending',
    
    });
    console.log('order:',order)
   // order = await order.save();
  if (!order) 
    return res.status(400).send("the order cannot be created");
  res.send(order);

//res.json({sessionId:session.id})
})*/
 

/*router.post('/webhook',express.raw({type:'application/json'}), async(req, res)=>{
  console.log('webhook triggered')
  const sig=req.headers['stripe-signature'];

  let event;

  try{
    event = Stripe.webhook.constructEvent(req.body, sig, process.env.STRIPE_WEB_SECRET);
  }catch (err){
    console.error('webhook signature error:', err.message);
    return res.status(400).send('webhook Error: ${err.message}');
  }

    if(event.type==='checkout.session.completed'){
      const session=event.data.object;
      const address=JSON.parse(session.metadata.address);
      const cartItems=JSON.parse(session.metadata.items);

       Promise.all(cartItems.map(item=>{
        const newOrderItem = OrderItem({
          quantity: item.quantity,
          prodiuct:item.product._id
        });
        return newOrderItem.save();
      }))
      .then(async orderItems=>{
        const orderItemsIds = orderItems.map(item=>item._id);

        let order = new Order({
        orderItems:orderItemsIds,
        shippingAddress1:address.address1,
        shippingAddress2:address.address2 || '',
        city:address.city,
        zip:address.zip,
        country:address.country,
        phone:address.phone,
        user:address.userId,
        totalPrice:session.unit_amount/100,
        status:'pending',
      });
      order = await order.save();
      if (!order) 
        return res.status(400).send("the order cannot be created");
      res.send(order)
      console.log('check:', order)
      })
  .then(()=>res.status(200).send('Order created successfully'))
  .catch(err=>{
    console.error('Order creation failed:',err);
    res.status(500).send('failed to save order');
  });
}else{
  res.status(200).send('webhook recieved');
}
});*/

  

/*.then((session)=>res.json({sessionId:session.id, url:session.url}))
       .catch(error=>{
        console.error(error);
        res.status(500).json({message: 'Stripe session failed'});
       });*/

module.exports = router;
