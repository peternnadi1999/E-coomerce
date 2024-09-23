const mongoose = require("mongoose");
// const categorySchema = require("./category");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    richDescription: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
      require:true
    },
    image: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      max: 5,
      min: 0,
    },
    numReview: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      default: "",
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    dateCreated: {
      type: String,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
productSchema.set("toJSON", {
  virtuals: true,
});
const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
