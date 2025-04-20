const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();
require("dotenv/config");
const Stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
//const baseURL="http://localhost:5173"
const baseURL="";




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
console.log('Items:',items)

    const address = req.body.address;
console.log('Address:',address)
    

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
    success_url:'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url:'http://localhost:5173/payment/failure',
     metadata:{
      items:JSON.stringify(items),
      address:JSON.stringify(address)
     }
    
  }).then((session)=>res.json({sessionId:session.id, url:session.url}))
    .catch(next);
  });
   /* Promise.all(items.map( item=>{
      const newOrderItem = OrderItem({
        quantity: item.quantity,
        prodiuct:item.product.id
      });
      return newOrderItem.save();
    }))
    .then(orderItems=>{
      const orderItemsIds = orderItems.map(item=>item.id);
    

    let order = new Order({
      //orderItems:lineItems,
      shippingAddress1:address.shippingAddress1,
      shippingAddress2:address.shippingAddress2 || '',
      city:address.city,
      zip:address.zip,
      country:address.country,
      phone:address.phone,
      user:address.userId,
      //totalPrice:session.amount_total/100,
      status:'pending',
    
    });
    order = await order.save();
  if (!order) 
    return res.status(400).send("the order cannot be created");
  res.send(order);*/
  ;





  router.post('/webhook',express.raw({type:'application/json'}), (req, res)=>{
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

         Promise.all(cartItems.map( item=>{
          const newOrderItem = OrderItem({
            quantity: item.quantity,
            prodiuct:item.product._id
          });
          return newOrderItem.save();
        }))
        .then(orderItems=>{
          const orderItemsIds = orderItems.map(item=>item._id);

        const order = new Order({
          orderItems:orderItemsIds,
          shippingAddress1:address.address1,
          shippingAddress2:address.address2 || '',
          city:address.city,
          zip:address.zip,
          country:address.country,
          phone:address.phone,
          user:address.userId,
          totalPrice:session.amount_total/100,
          status:'pending',
        });
        return order.save();

        })
    .then(()=>res.status(200).send('Order created successfully'))
    .catch(err=>{
      console.error('Order creation failed:',err);
      res.status(500).send('failed to save order');
    });
  }else{
    res.status(200).send('webhook recieved');
  }
});

/*.then((session)=>res.json({sessionId:session.id, url:session.url}))
       .catch(error=>{
        console.error(error);
        res.status(500).json({message: 'Stripe session failed'});
       });*/

module.exports = router;
