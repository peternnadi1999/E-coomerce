const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
});
categorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});
categorySchema.set("toJSON", {
  virtuals: true,
});

// module.exports = categorySchema;
const Category = new mongoose.model("Category", categorySchema);
module.exports = Category;
