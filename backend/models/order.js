const mongoose = require("mongoose");
const OrderItem = require("./orderItems");
const User = require("./user");
const orderSchema = new mongoose.Schema(
  {
    shippingAddress1: {
      type: String,
      required: true,
    },
    shippingAddress2: {
      type: String,
    },
    zip: {
      type: String,
    },
    phone_number: {
      type: Number,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],
  },
  {
    timestamps: true,
  }
);
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderSchema.set("toJSON", {
  virtuals: true,
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
