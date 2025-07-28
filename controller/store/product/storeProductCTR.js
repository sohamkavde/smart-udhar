const Product = require("../../../models/store/product/product"); // Adjust path as needed
// Update Product 
const ProductHistory = require("../../../models/store/product/productHistory"); // Adjust path as needed
const  mongoose = require("mongoose");

// Create Product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Product created",
        product: savedProduct,
      });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = id; // id is product ID

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const existingProduct = await Product.findById(_id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Save history
    await ProductHistory.create({
      product_id: _id,
      changes: {
        before: existingProduct.toObject(),
        after: req.body,
      },
      store_id: req.body?.store_id,  
      storeProfile_id: req.body?.storeProfile_id, 
    });

    // Now update the product
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProductHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = id; // id is product ID

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const history = await ProductHistory.find({ product_id: productId }) // Optional: populate updater info
      .sort({ updated_at: -1 }); // Most recent first

    if (history.length === 0) {
      return res.status(404).json({ success: false, message: "No history found for this product" });
    }

    res.status(200).json({
      success: true,
      message: "Product update history fetched successfully",
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Error fetching product history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const deleted = await Product.findByIdAndDelete(_id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted", product: deleted });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Find Product by ID
const findProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(_id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error finding product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;
    const products = await Product.find({ store_id, storeProfile_id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: products.length, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProductHistory,
  deleteProduct,
  findProductById,
  getAllProducts,
};
