// middlewares/uploadAndReplaceImage.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const StoreStaff = require("../../models/store/staff/storeStaffModel"); // Adjust the path as necessary

// Set upload path
const uploadDir = path.join(__dirname, "../../assets/uploadStaffImage");
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
}).single("image");


// Middleware to handle deletion and new upload
const uploadAndReplaceImage = async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (req.file) {
      try {
        const staffId = req.params.id;
        const staff = await StoreStaff.findById(staffId);

        if (staff && staff.image) {
          const oldPath = path.join(uploadDir , staff.image);
          
          if (fs.existsSync(oldPath)) {            
              fs.unlinkSync(oldPath); // delete previous image
          }
        }

        req.body.image =req.file.filename; // Set new image path
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Image update error", error: error.message });
      }
    }

    next();
  });
};

module.exports = uploadAndReplaceImage;
