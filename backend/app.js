const express = require("express");
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");

const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config()
require("dotenv/config");

app.post('/webhook',express.raw({type:'application/json'}), (req, res)=>{
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

const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const path = require("path");




app.use(cors());
app.options("*", cors());



//middleware

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
app.use(express.static(path.join(__dirname, "dist")));
app.use('api/v1/webhook',require("./routers/orders"));
app.use(express.json());

app.use(errorHandler);
app.use(authJwt());

app.use((req, res, next)=>{
  if(req.path=== '/favicon.ico'){
    return next();
  }
  next();
})

app.use(morgan("combined*"));

//route
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");


const api = process.env.API_URL;



//routers
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);



//database

mongoose
  .connect(process.env.BASE_URL)
  .then(() => {
    console.log("database connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server is running on port" + port);
});
