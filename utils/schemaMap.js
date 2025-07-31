// utils/schemaMap.js
const Product = require("../models/store/product/product");
const Customer = require("../models/store/customer/customer");

module.exports = {
  Product, // Key matches what is passed from frontend (e.g., "Product")
  Customer, // Key matches what is passed from frontend (e.g., "Customer")
};
