// models/MenuItem.js
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name for the menu item"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    min: [0, "Price cannot be negative"],
  },
  category: {
  type: String,
  required: true
},
  imageUrl: {
    type: String,
    required: [true, "Please add an image URL"],
    match: [
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
      "Please add a valid URL",
    ],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
