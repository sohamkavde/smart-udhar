const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../assets/uploadsProduct")); // Adjust as needed
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb("Error: Images Only!");
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = uploadImage;
