const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/store/product/product"); // Adjust path as needed

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../assets/uploadsProduct");
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb("Error: Images Only!");
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}); // 2MB limit

// Middleware: handle image upload + delete old image if replacing
const uploadImageWithReplace = (fieldName) => {
  return async (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      // If new image uploaded
      if (req.file) {
        const productId = req.params.id;

        if (productId && productId.match(/^[0-9a-fA-F]{24}$/)) {
          try {
            const product = await Product.findById(productId);
            if (product && product.product_image) {
              const oldImagePath = path.join(
                __dirname,
                "../assets/uploadsProduct",
                product.product_image
              );
              if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
          } catch (error) {
            console.warn("Error deleting old image:", error.message);
          }
        }

        // Pass the filename to controller
        req.body.product_image = req.file.filename;
      }

      next();
    });
  };
};

module.exports = uploadImageWithReplace;
