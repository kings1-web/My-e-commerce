const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config()
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const path = require("path");




app.use(cors({
  origin: 'https://kings-ecommerce.onrender.com',
  credentials:true
}));
app.options("*", cors());



//middleware

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
app.use(express.static(path.join(__dirname, "dist")));
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
app.use(`${api}/orders/webhook`, ordersRouter);
app.use(express.json());
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
