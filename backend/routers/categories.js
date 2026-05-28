const { Category } = require("../models/category");
const express = require("express");
const multer = require("multer");
const { Product } = require("../models/product");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

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
    format: async (req, file) => "jpeg",
    public_id: (req, file) => file.originalname.split(".")[0],
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { fetch_format: "auto" },
      { quality: "auto" },
    ],
  },
});*/

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "products",
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,

      transformation: [
        {
          width: 800,
          height: 800,
          crop: "fill",      // 🔥 forces same size
          gravity: "auto"    // 🔥 smart cropping (focus on object)
        },
        {
          fetch_format: "auto",
          quality: "auto"
        }
      ]
    };
  }
});

const uploadOptions = multer({ storage });


router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }

  
  res.status(200).send(categoryList);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res
      .status(500)
      .json({ message: "the category with the given id was not found" });
  }
  res.status(200).send(category);
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("no image in the request");

  

  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
    image:file.path.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/")   //`${basePath}${fileName}`, // "http://localhost:3000/public/uploads/1mage-2323232"
  });

  category = await category.save();
  if (!category) return res.status(404).send("the category cannot be created");
  res.send({
    ...category._doc,
    image:category.image.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/")
  });
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status("Invalid Category");

  const file = req.file;

  let imagepath=category.image;
  

  if (file) {
   
    imagepath=file.path.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/")  //`${basePath}${fileName}`;
  } 

  const updateCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
      image:imagepath,
      
    },
    { new: true }
  );
  if (!updateCategory)
    return res.status(500).send("the category cannot be updated");
  res.send({
    ...updateCategory._doc,
    image:category.image.replace("/upload/", "/upload/w_800,h_800,q_auto,f_auto/")
  });
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "the category is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: true, message: "category not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});
module.exports = router;
