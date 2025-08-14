const Product = require("../../../models/store/product/product"); // Adjust path as needed
// Update Product
const ProductHistory = require("../../../models/store/product/productHistory"); // Adjust path as needed
const mongoose = require("mongoose");
const ExcelJS = require("exceljs"); // Ensure you have exceljs installed for exporting to Excel
const PDFDocument = require("pdfkit");

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      quantity, // quantity and min_quantity are used for stock management like out of 50 products, how many are available
      min_quantity,
      unit,
      sales_price,
      purchase_price,
      category,
      hsn_number,
      price_type,
      product_type,
      store_id,
      storeProfile_id,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !unit ||
      !category ||
      !quantity ||
      !min_quantity ||
      !hsn_number ||
      !sales_price ||
      !purchase_price ||
      !price_type ||
      !product_type ||
      !store_id ||
      !storeProfile_id
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // If file uploaded, set image name
    let product_image = "";
    if (req.file) {
      product_image = req.file.filename;
    }

    const newProduct = new Product({
      ...req.body,
      product_image,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const existingProduct = await Product.findById(_id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
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
    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

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
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const history = await ProductHistory.find({ product_id: productId }) // Optional: populate updater info
      .sort({ updated_at: -1 }); // Most recent first

    if (history.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No history found for this product" });
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
    const { store_id, storeProfile_id } = req.params;

    // Support both query string and body, fallback to defaults
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ store_id, storeProfile_id })
        .sort({ created_at: -1 }) // match schema field name
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ store_id, storeProfile_id }),
    ]);

    res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { store_id, storeProfile_id, name, category } = req.body;

    if (!store_id || !storeProfile_id) {
      return res.status(400).json({
        success: false,
        message: "store_id and storeProfile_id are required",
      });
    }

    const query = {
      store_id,
      storeProfile_id,
    };

    if (name) {
      query.name = { $regex: name, $options: "i" }; // case-insensitive search
    }

    if (category) {
      query.category = { $regex: category, $options: "i" }; // case-insensitive search
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const uploadExcelData = async (req, res) => {
  try {
    const inserted = await req.Model.insertMany(req.excelData);
    res.status(200).json({
      message: "Data inserted successfully",
      count: inserted.length,
      data: req.excelData,
    });
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: "Failed to insert data" });
  }
};

const exportProductsToExcel = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;
    const products = await Product.find({ store_id, storeProfile_id }).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Product Image", key: "product_image", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Min Quantity", key: "min_quantity", width: 15 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Sales Price", key: "sales_price", width: 15 },
      { header: "Purchase Price", key: "purchase_price", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "HSN Number", key: "hsn_number", width: 15 },
      { header: "Tax", key: "tax", width: 10 },
      { header: "Price Type", key: "price_type", width: 15 },
      { header: "Product Type", key: "product_type", width: 15 },
    ];

    worksheet.addRows(products);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export failed:", error);
    res.status(500).json({ message: "Failed to export products" });
  }
};

const exportProductsToPDF = async (req, res) => {
  try {
    const store_id = req.params.store_id;
    const storeProfile_id = req.params.storeProfile_id;
    const products = await Product.find({ store_id, storeProfile_id }).lean();

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(16).text("Product List", { align: "center" });
    doc.moveDown();

    // Column headers and widths
    const columns = [
      { key: "name", label: "Name", width: 100 },

      { key: "quantity", label: "Qty", width: 40 },
      { key: "min_quantity", label: "Min Qty", width: 80 },
      { key: "unit", label: "Unit", width: 40 },
      { key: "sales_price", label: "Sales Price", width: 100 },
      { key: "purchase_price", label: "Purchase Price", width: 100 },
      { key: "category", label: "Category", width: 80 },
      { key: "hsn_number", label: "HSN", width: 80 },
      { key: "tax", label: "Tax", width: 40 },
      { key: "price_type", label: "Price Type", width: 60 },
      { key: "product_type", label: "Type", width: 60 },
    ];

    const tableTop = doc.y;
    const rowHeight = 25;
    let x = doc.page.margins.left;
    let y = tableTop;

    // Draw table header
    doc.font("Helvetica-Bold").fontSize(10);
    columns.forEach((col) => {
      doc.rect(x, y, col.width, rowHeight).stroke();
      doc.text(col.label, x + 5, y + 8, {
        width: col.width - 10,
        align: "left",
      });
      x += col.width;
    });

    y += rowHeight;

    // Draw table rows
    doc.font("Helvetica").fontSize(9);
    products.forEach((product) => {
      x = doc.page.margins.left;

      // Check if next row exceeds page height
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;

        // Redraw headers
        doc.font("Helvetica-Bold").fontSize(10);
        columns.forEach((col) => {
          doc.rect(x, y, col.width, rowHeight).stroke();
          doc.text(col.label, x + 5, y + 8, { width: col.width - 10 });
          x += col.width;
        });
        y += rowHeight;
        doc.font("Helvetica").fontSize(9);
      }

      x = doc.page.margins.left;
      columns.forEach((col) => {
        let text =
          product[col.key] !== undefined ? String(product[col.key]) : "";
        doc.rect(x, y, col.width, rowHeight).stroke();
        doc.text(text, x + 5, y + 8, {
          width: col.width - 10,
          height: rowHeight,
          ellipsis: true,
        });
        x += col.width;
      });

      y += rowHeight;
    });

    doc.end();
  } catch (error) {
    console.error("PDF export failed:", error);
    res.status(500).json({ message: "Failed to export products to PDF" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProductHistory,
  deleteProduct,
  findProductById,
  getAllProducts,
  uploadExcelData,
  exportProductsToExcel,
  searchProducts,
  exportProductsToPDF,
};
