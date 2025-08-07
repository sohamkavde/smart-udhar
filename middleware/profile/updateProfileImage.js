const multer = require("multer");
const path = require("path");
const fs = require("fs");
const moment = require("moment-timezone");
const Profile = require("../../models/store/profile/profile");

const uploadDir = path.join(__dirname, "../../assets/uploadProfileImage");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = moment().format("YYYYMMDD-HHmmss-SSS");
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}_${uniqueSuffix}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid =
    allowedTypes.test(file.mimetype) &&
    allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) cb(null, true);
  else cb(new Error("Only jpeg, jpg, png, webp files allowed"));
};

// Multer uploader
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
}).fields([
  { name: "signatureImage", maxCount: 1 },
  { name: "logoImage", maxCount: 1 },
]);

// Middleware handler
const updateProfileImage = async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ status: "error", message: err.message });
    }

    const profileId = req.params.id;
    if (!profileId) return next();

    try {
      const existingProfile = await Profile.findById(profileId);
      if (!existingProfile) return next();

      // Loop through each image field
      for (const field of ["signatureImage", "logoImage"]) {
        if (req.files && req.files[field]) {
          const newImage = req.files[field][0].filename;
          const oldImage = existingProfile[field];

          // Delete old image from disk
          if (oldImage) {
            const oldImagePath = path.join(uploadDir, oldImage);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
          }

          // Assign new filename to body for DB update
          req.body[field] = newImage;
        }
      }

      next();
    } catch (error) {
      console.error("Error in updateProfileImage middleware:", error);
      return res.status(500).json({
        status: "error",
        message: "Image processing failed",
      });
    }
  });
};

module.exports = updateProfileImage;
