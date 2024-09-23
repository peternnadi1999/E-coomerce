require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const productRouter = require("./routes/products");
const orderRouter = require("./routes/order");
const userRouter = require("./routes/user");
const categoriesRouter = require("./routes/categories");
const passport = require("passport");
const cors = require("cors");
const config = require("./config");

// const api = process.env.API_URL;
const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  session({
    resave: false,
    secret: "pwteiew",
    name: "session-id",
    saveUninitialized: false,
  })
);
app.use(passport.session());
app.use(passport.initialize());
app.use(express.static(__dirname));

app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/user", userRouter);
app.use("/category", categoriesRouter);

mongoose.connect(config.mongoUrl).then(() => {
  console.log("database connected");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Successfully connected");
});
