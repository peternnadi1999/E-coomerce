const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const authenticate = require("../authenticate");
// const { findByUsername } = require("../models/order");

const UserRouter = express.Router();

UserRouter.route("/").get((req, res) => {
  User.find({}).then((user) => {
    if (user) {
      res.send(user);
    } else {
      res.send("invalid user");
    }
  });
});
UserRouter.route("/get/count").get(async (req, res) => {
  const userCount = await User.countDocuments().then((count) => {
    if (count) {
      res.statusCode = 200;
      res.json({ count: count });
    } else {
      res.statusCode = 400;
      res.json("invalid");
    }
  });
});

UserRouter.route("/register").post((req, res) => {
  User.register(
    User({
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      phone_number: req.body.phone_number,
      isAdmin: req.body.isAdmin,
      country: req.body.country,
      zip: req.body.zip,
      apartment: req.body.apartment,
      city: req.body.city,
      street: req.body.street,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-type", "application/json");
        res.json({ err: err });
      }
      passport.authenticate("local")(req, res, () => {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");
        res.send(user);
        res.json({
          status: "Registration successful",
          success: true,
        });
      });
    }
  );
});
UserRouter.route("/login").post(passport.authenticate("local"), (req, res) => {
  console.log(req.user);
  let token = authenticate.getToken({ _id: req.user._id });
  console.log(token);
  res.statusCode = 200;
  res.setHeader("Content-type", "application/json");
  res.json({
    token: token,
    status: "You are successfully Logged in",
    success: true,
  });
});
// UserRouter.route("/login").post((req, res) => {
//   const user = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });
//   req.login(
//     user,
//     function (err) {
//       if (err) {
//         res.statusCode = 500;
//         res.setHeader("Content-type", "application/json");
//         res.json({ err: err });
//       } else {
//       passport.authenticate("local")(req, res, () => {
//         console.log(req.user);
//         let token = authenticate.getToken({ _id: req.user });
//         console.log(token);
//         res.statusCode = 200;
//         res.setHeader("Content-type", "application/json");
//         res.json({
//           token: token,
//           status: "You are successfully Logged in",
//           success: true,
//         });
//       });
//     }
//     }
//   );
// });
UserRouter.route("/:id").get((req, res) => {
  User.findById({ _id: req.params.id }).then((user) => {
    if (user) {
      res.send(user);
    } else {
      res.send("invalid user");
    }
  });
});
UserRouter.route("/resetpassword").post((req, res) => {
  User.findByUsername(req.body.username, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      user.changePassword(
        req.body.oldpassword,
        req.body.newpassword,
        function (err) {
          if (err) {
            res.send(err);
          } else {
            res.send("successfully change password");
          }
        }
      );
    }
  });
});

module.exports = UserRouter;
