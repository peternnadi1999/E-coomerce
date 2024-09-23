const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // username: {
  //   type: String,
  //   required: true,
  // },
  // password: {
  //   type: String,
  // },
  phone_number: {
    type: Number,
  },
  zip: {
    type: String,
    default: "",
  },

  country: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  street: {
    type: String,
    default: "",
  },
  apartment: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
userSchema.set("toJSON", {
  virtuals: true,
});
userSchema.plugin(passportLocalMongoose);

const User =new mongoose.model("User", userSchema);
module.exports = User;

