const express = require("express");
const Product = require("../models/products");
const authenticate = require("../authenticate");
const Category = require("../models/category");
const multer = require("multer");
const { default: mongoose } = require("mongoose");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image upload");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(" ", "-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

const productRouter = express.Router();
productRouter
  .route("/")
  .get((req, res, next) => {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    Product.find(filter)
      .populate("category")
      .then(
        (product) => {
          if (product) {
            res.statusCode = 200;
            res.setHeader("Content-type", "application/json");
            res.send(product);
          } else {
            res.statusCode = 403;
            res.setHeader("Content-type", "application/json");
            res.send({ success: false });
          }
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, err: err });
      });
  })
  .post(authenticate.vertifyUser, upload.single("image"), (req, res) => {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const category = Category.findById(req.body.category);
    if (!category) {
      res.statusCode = 400;
      res.send("invalid category");
    }
    const file = req.file;
    if (!file) {
      res.statusCode = 400;
      res.send("No image in the request");
    }
    Product.create({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      price: req.body.price,
      image: `${basePath}${fileName}`,
      images: req.body.images,
      rating: req.body.rating,
      numReview: req.body.numReview,
      brand: req.body.brand,
      countInStock: req.body.countInStock,
      category: req.body.category,
    })
      .then((product) => {
        if (product) {
          res.statusCode = 200;
          res.send(product);
        } else {
          res.statusCode = 500;
          res.send("products can not be created!");
        }
      })
      .catch((err) => {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, err: err });
      });
  });
productRouter.route("/getcount").get(async (req, res) => {
  const productCount = await Product.countDocuments().then((count) => {
    if (count) {
      res.statusCode = 200;
      res.json({ count: count });
    } else {
      res.statusCode = 400;
      res.json("invalid");
    }
  });
});
productRouter.route("/featured/:count").get(async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  await Product.find({ isFeatured: true })
    .limit(+count)
    .then((count) => {
      if (count) {
        res.json({ count: count });
        res.statusCode = 200;
      } else {
        res.statusCode = 400;
        res.json("invalid");
      }
    });
});

productRouter
  .route("/:id")
  .delete(authenticate.vertifyUser, (req, res) => {
    Product.deleteOne({ _id: req.params.id })
      .then((product) => {
        if (product) {
          res.statusCode = 200;
          res.setHeader("Content-type", "application/json");
          res.send({ success: true, message: "successfully deleted!" });
        } else {
          res.statusCode = 404;
          res.setHeader("Content-type", "application/json");
          res.send({ success: false, message: "product not found!" });
        }
      })
      .catch((err) => {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, err: err });
      });
  })
  .get((req, res) => {
    Product.findOne({ _id: req.params.id })
      .populate("category")
      .then((product) => {
        if (product) {
          res.statusCode = 200;
          res.setHeader("Content-type", "application/json");

          res.send(product);
        } else {
          res.statusCode = 404;
          res.setHeader("Content-type", "application/json");
          res.send({ success: false, message: "Product not found!" });
        }
      });
  })
  .put(authenticate.vertifyUser, (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("invalid Product Id");
    const category = Category.findById(req.body.category);
    if (!category) return res.status(400).send("invalid category");
    Product.findByIdAndUpdate(
      { _id: req.params.id },
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        price: req.body.price,
        image: req.body.image,
        images: req.body.images,
        rating: req.body.rating,
        numReview: req.body.numReview,
        brand: req.body.brand,
        countInStock: req.body.countInStock,
        category: req.body.category,
      },
      {
        new: true,
      }
    ).then((update) => {
      if (update) {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");
        res.send({ success: true, message: "Successfully updated Product" });
      }
    });
  });
productRouter.route("/gallery/:id").put(upload.array("images"), (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send("invalid Product Id");
  const files = req.files;
  const imagesPath = [];
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  if (files) {
    files.map((file) => {
      imagesPath.push(`${basePath}${file.filename}`);
    });
  }
  Product.findByIdAndUpdate(
    req.params.id,
    { images: imagesPath },
    {
      new: true,
    }
  ).then((update) => {
    if (update) {
      res.send({ success: true, message: "Successfully updated Product" });
      res.statusCode = 200;
    } else {
      res.send({ success: false, message: "updated unsuccessful" });
    }
  });
});
module.exports = productRouter;
