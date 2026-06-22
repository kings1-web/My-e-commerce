require("dotenv").config();
const { Category } = require("../models/category");
const { Product } = require("../models/product");
// 🟢 FIXED: Imported the Review model so the aggregate calculation works!
const { Review } = require("../models/review");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
//const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();
//CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//MULTER CLOUDINARY STORAGE
/*const storage = new CloudinaryStorage({
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
const storage = multer.memoryStorage();
const uploadOptions = multer({ storage });



const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        transformation: [
          {
            width: 800,
            height: 800,
            crop: "fill",
            gravity: "auto",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};



router.get("/", async (req, res) => {
  try {
    const productsList = await Product.find().populate("category");

    // Map through products to calculate review statistics on-the-fly
    const productsWithRatings = await Promise.all(
      productsList.map(async (product) => {
        let averageRating = 0;
        let totalReviews = 0;

        // 🟢 Guarded with a local catch so a single broken product can't crash the API
        try {
          const reviews = await Review.find({ product: product.id });
          totalReviews = reviews.length;
          
          if (totalReviews > 0) {
            const total = reviews.reduce((sum, r) => sum + r.rating, 0);
            averageRating = total / totalReviews;
          }
        } catch (reviewErr) {
          console.error(`Failed to parse reviews for product ${product.id}:`, reviewErr.message);
        }

        return {
          ...product.toObject(),
          id: product.id, 
          averageRating: averageRating,
          reviewCount: totalReviews
        };
      })
    );

    res.status(200).json(productsWithRatings);
  } catch (err) {
    // 🟢 Prints the exact crash description in your terminal console window!
    console.error("Critical error in public products fetch:", err); 
    res.status(500).json({ success: false, error: err.message });
  }
});



router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

/*router.post("/", uploadOptions.single("image"), async (req, res) => {
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
});*/

router.post("/", uploadOptions.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    if (!req.file) return res.status(400).send("No image uploaded");

    const result = await uploadToCloudinary(req.file.buffer);

    let product = new Product({
      name: req.body.name,
      discription: req.body.discription,
      richDiscription: req.body.richDiscription,
      image: result.secure_url,
      imagePublicId: result.public_id,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    product = await product.save();

    res.status(201).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

/*router.put("/:id", uploadOptions.single("image"), async (req, res) => {
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
});*/

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    let imageUrl = product.image;
    let imagePublicId = product.imagePublicId;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;   // ✅ ADD HERE
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        discription: req.body.discription,
        richDiscription: req.body.richDiscription,
        image: imageUrl,
         imagePublicId: imagePublicId,   // ✅ ADD HERE
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

    res.send(updatedProduct);
  } catch (error) {
    res.status(500).send(error);
  }
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
  try {
    const count = req.params.count ? req.params.count : 0;
    
    // 1. Fetch only featured products from your MongoDB collection
    const productsList = await Product.find({ isFeatured: true }).limit(+count);

    if (!productsList || productsList.length === 0) {
      return res.status(200).json([]); // Return empty array instead of 500 error block
    }

    // 2. Loop through featured items to attach average review scores on-the-fly
    const productsWithRatings = await Promise.all(
      productsList.map(async (product) => {
        let averageRating = 0;
        let totalReviews = 0;

        try {
          const reviews = await Review.find({ product: product.id });
          totalReviews = reviews.length;
          
          if (totalReviews > 0) {
            const total = reviews.reduce((sum, r) => sum + r.rating, 0);
            averageRating = total / totalReviews;
          }
        } catch (reviewErr) {
          console.error(`Failed to parse reviews for featured product ${product.id}:`, reviewErr.message);
        }

        return {
          ...product.toObject(),
          id: product.id, 
          averageRating: averageRating,
          reviewCount: totalReviews
        };
      })
    );

    res.status(200).json(productsWithRatings);
  } catch (err) {
    console.error("Critical error in featured products fetch:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


/*router.put(
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
);*/


module.exports = router;
