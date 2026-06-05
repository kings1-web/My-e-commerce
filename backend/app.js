const express = require("express");
const path = require("path");
const app = express();
//const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require('dotenv');
//dotenv.config()
//require("dotenv/config");

const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");


//route
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");



const api = process.env.API_URL;


app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));


//app.options("*", cors());



//middleware
//app.use(bodyParser.json());
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));



//routers
app.use(`${api}/categories`,authJwt(), categoriesRouter);
app.use(`${api}/orders`,authJwt(), ordersRouter);
app.use(`${api}/products`,authJwt(), productsRouter);
app.use(`${api}/users`,authJwt(), usersRouter);


app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback (VERY IMPORTANT)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

//app.use();
app.use(errorHandler);


app.use((req, res, next)=>{
  if(req.path=== '/favicon.ico'){
    return next();
  }
  next();
})










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
