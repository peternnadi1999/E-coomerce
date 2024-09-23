const Category = require("../models/category");
const express = require("express");

const categoriesRouter = express.Router();

categoriesRouter
  .route("/")
  .get((req, res, next) => {
    Category.find({})
      .then(
        (category) => {
          if (category) {
            res.send(category);
            res.statusCode = 200;
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
  .post((req, res) => {
    Category.create(req.body)
      .then((category) => {
        console.log(category);
        if (!category) {
          res.send("Categories can not be created!");
        } else {
          res.statusCode = 200;
          res.setHeader("Content-type", "application/json");
          res.send(category);
        }
      })
      .catch((err) => {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, err: err });
      });
  });

categoriesRouter
  .route("/:id")
  .delete((req, res) => {
    Category.deleteOne({ _id: req.params.id })
      .then((category) => {
        if (category) {
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
  })
  .get((req, res) => {
    Category.findOne({ _id: req.params.id }).then((category) => {
      if (category) {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");

        res.send(category);
      } else {
        res.statusCode = 404;
        res.setHeader("Content-type", "application/json");
        res.send({ success: false, message: "Category not found!" });
      }
    });
  })
  .put((req, res) => {
    Category.findByIdAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    }).then((update) => {
      if (update) {
        res.setHeader("Content-type", "application/json");
        res.statusCode = 200;

        res.send({ success: true, message: "Successfully updated category" });
        // res.send(update);
      }
    });
  });

module.exports = categoriesRouter;
