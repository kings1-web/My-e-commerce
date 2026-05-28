require("dotenv").config();
const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();
//CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//MULTER CLOUDINARY STORAGE
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    format:async(req, file)=>"jpg",
    public_id:(req, file)=>file.originalname.split(".")[0],    //file.originalname.split(".")[0],
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { fetch_format: "auto" },
      { quality: "auto" },
    ],
  },
});

/*const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "products",
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,

      transformation: [
        {
          width: 800,
          height: 800,
          crop: "pad",    
          background:"white"    
        },
        {
          fetch_format: "auto",
          quality: "auto"
        }
      ]
    };
  }
});*/

const uploadOptions = multer({ storage });



router.get("/", async (req, res) => {
  //localhost:3000/api/v1/products?categories=12345,134567
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("no image in the request");

  const files = file.path.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/");

 

  let product = new Product({
    name: req.body.name,
    discription: req.body.discription,
    richDiscription: req.body.richDiscription,
    image: files, //`${basePath}${fileName}`, // "http://localhost:3000/public/uploads/1mage-2323232"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeature: req.body.isFeature,
  });
  product = await product.save();
  if (!product) return res.status(500).send("the product cannot be created");
  res.send({
    ...product._doc,
    image:product.image.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/")
  });
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product");

  const file = req.file;

  let imagepath=product.image;

  if (file) {
   
   imagepath=file.path.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/");   //`${basePath}${fileName}`;
  }

  const updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      discription: req.body.discription,
      richDiscription: req.body.richDiscription,
      image:imagepath,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!updateProduct)
    return res.status(500).send("the product cannot be updated");
  res.send({
    ...updateProduct._doc,
    image:product.image.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/")
  });
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: true, message: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

router.get("/get/featured/:count", async (req, res) => {
  count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});


router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const files = req.files;
    let imagesPaths = [];

    if (files && files.length > 0) {
      imagesPaths = files.map((file) => {
        return file.path.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/");
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("The gallery cannot be updated");

    res.send(product);
  }
);


module.exports = router;
