const mongoose = require("mongoose");
const express = require("express");
const Order = require("../models/order");
const { OrderItem } = require("../models/orderItems");

const orderRouter = express.Router();

orderRouter
  .route("/")
  .get((req, res, next) => {
    Order.find({})
      .populate("user")
      .sort({ createdAt: -1 })
      .then(
        (orderList) => {
          if (orderList) {
            res.statusCode = 200;
            res.setHeader("Content-type", "application/json");
            res.send(orderList);
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
  .post(async (req, res) => {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        const orders = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        await orders.save();
        return orders._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product",
          "price"
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    Order.create({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      zip: req.body.zip,
      phone_number: req.body.phone_number,
      country: req.body.country,
      city: req.body.city,
      user: req.body.user,
      totalPrice: totalPrice,
    })
      .then(
        (order) => {
          if (!order) {
            res.send("Categories can not be created!");
          } else {
            res.statusCode = 200;
            res.setHeader("Content-type", "application/json");
            res.send(order);
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
  });
orderRouter
  .route("/:id")
  .get((req, res, next) => {
    Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .then(
        (order) => {
          if (order) {
            res.send(order);
            res.statusCode = 200;
            res.setHeader("Content-type", "application/json");
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
  .put((req, res) => {
    Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
      }
    )
      .then((update) => {
        if (update) {
          res.statusCode = 200;
          res.setHeader("Content-type", "application/json");

          res.send({ success: true, message: "Successfully updated Order" });
          //  res.send(update);
        } else {
          res.statusCode = 403;
          res.setHeader("Content-type", "application/json");
          res.send({ success: false });
        }
      })
      .catch((err) => {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, err: err });
      });
  })
  .delete((req, res) => {
    Order.findByIdAndRemove(req.params.id)
      .then(async (order) => {
        if (order) {
          await order.orderItems.map(async (orderItem) => {
            await OrderItem.findByIdAndRemove(orderItem);
          });
          res.statusCode = 200;
          res.setHeader("Content-type", "application/json");
          res.send({ success: true, message: "successfully deleted!" });
        } else {
          res.statusCode = 404;
          res.setHeader("Content-type", "application/json");
          res.send({ success: false, message: "category not found!" });
        }
      })
      .catch((err) => {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, err: err });
      });
  });
orderRouter.route("/get/totalsale").get(async (req, res) => {
  let totalSales = await Order.aggregate([
    { $group: { _id: null, totolsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    res.statusCode = 404;
    res.send({ success: false, message: "Can not generate total sales" });
  } else {
    res.statusCode = 200;
    res.send({ totalsales: totalSales.pop().totolsales });
  }
});
orderRouter.route("/get/count").get(async (req, res) => {
  const orderCount = await Order.countDocuments().then((count) => {
    if (count) {
      res.statusCode = 200;
      res.json({ count: count });
    } else {
      res.statusCode = 400;
      res.json("invalid");
    }
  });
});
orderRouter.route("/get/userorder/:userId").get((req, res, next) => {
  Order.find({ user: req.params.userId })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ createdAt: -1 })
    .then(
      (userorderList) => {
        if (userorderList) {
          res.statusCode = 200;
          res.send(userorderList);
        } else {
          res.statusCode = 403;
          res.send({ success: "NO Orders" });
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
});
module.exports = orderRouter;
