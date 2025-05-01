const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
//const Stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);



router.post('/webhook',express.raw({type:'application/json'}), async(req, res)=>{
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
          prodiuct:item.product
        });
        return newOrderItem.save();
      }))
      .then(async orderItems=>{
        const orderItemsIds = orderItems.map(item=>item._id);

        let order = new Order({
        orderItems:orderItemsIds,
        shippingAddress1:address.shippingAddress1,
        shippingAddress2:address.shippingAddress2,
        city:address.city,
        zip:address.zip,
        country:address.country,
        phone:address.phone,
        user:address.user,
        totalPrice:session.amount_total/100,
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
});

     
  
   


module.exports = router;
