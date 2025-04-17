const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
require("dotenv/config");
const Stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
const baseURL="http://localhost:5173"




router.get("/", async (req, res) => {
  const orderList = await Order.find().populate('user','name')
  .populate({
    path: 'orderItems', populate:{
      path:'product', populate: 'category'}
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
    path: 'orderItems', populate:{
      path:'product', populate: 'category'}
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
    const orderItemsIds =Promise.all(req.body.orderItems.map(async (orderItem)=>{
      let newOrderItem = new  OrderItem({
        quantity:orderItem.quantity,
        product:orderItem.product
      })
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
  }))
   const orderItemsIdsResolved = await orderItemsIds;


   const totalPrices =await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
   const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
   const totalPrice = orderItem.product.price * orderItem.quantity;
     return totalPrice
   }))

   const totalPrice = totalPrices.reduce((a,b)=> a + b, 0);

   console.log(totalPrices)

  let order = new Order({
    orderItems:orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice:totalPrice,
    user: req.body.user,
  });
  order = await order.save();
  if (!order) 
    return res.status(400).send("the order cannot be created");
  res.send(order);
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
    const userOrderList = await Order.find({user: req.params.userid}).populate({
      path: 'orderItems', populate:{
        path:'product', populate: 'category'}
      }).sort({'dateOrdered':-1});
  
    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.send(userOrderList);
  });

  router.post('/create-checkout-session', (req, res, next)=>{
    const items = req.body.items;
    const billingAddress = req.body.billingAddress;
    

    if(!items.length || !billingAddress){
      return next({status:400, message: 'missing required fields'})
    }

    const lineItems = items.map((item)=>({
      price_data:{
        currency:'NGN',
        product_data:{
          name:item.name,
        },
        unit_amount:item.unit_price*100,
      },
      quantity:item.quantity,
    }))
    Stripe.checkout.sessions.create({
    payment_method_types:['card'],
    line_items:lineItems,
    mode:'payment',
    success_url:`${baseURL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`${baseURL}/payment/failure`,
    metadata:{
      billingAddress:JSON.stringify(billingAddress), items:JSON.stringify(items)
    }
    }).then((session)=>res.json({sessionId:session.id, url:session.url}))
    .catch(next);
  });

  router.post('/webhook',express.raw({type:'application/json'}), (req, res, next)=>{
    const sig=req.headers['stripe-signature'];

    Stripe.webhook.constructEvent(req.body, sig, process.env.STRIPE_WEB_SECRET)
    .then(event=>{
      if(event.type==='checkout.session.completed'){
        const session=event.data.object;
        const billingAddress=JSON.parse(session.metadata.billingAddress);
        const cartItems=JSON.parse(session.metadata.items);

        return Promise.all(cartItems.map(item=>
          new OrderItem({
            quantity:item.quantity,
            product:item.id,
          }).save()
        )).then(orderItemsIds=>{
          const totalPrice=cartItems.reduce((acc, item)=>acc+item.price*item.quantity,0);

        return new Order({
          orderItems:orderItemsIds,
          shippingAddress1:billingAddress.shippingAddress1,
          shippingAddress2:billingAddress.shippingAddress2,
          city:billingAddress.city,
          zip:billingAddress.zip,
          country:billingAddress.country,
          phone:billingAddress.phone,
          user:billingAddress.userId,
          totalPrice:session.amount_total/100,
          status:'pending',
        }).save();

        })
      }
    }).then(()=>res.status(200).json({message:'Order created successfully'}))
    .catch(next);
  });

module.exports = router;
