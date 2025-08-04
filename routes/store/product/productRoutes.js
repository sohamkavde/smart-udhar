var express = require("express");
var router = express.Router();
const common = require("../../../helper/common");

// middleware
const asyncHandler = require("../../../middleware/async");
const excelParser = require("../../../middleware/excelParser");
const multer = require("multer");
const uploadImage = require("../../../middleware/uploadImage");
const uploadImageWithReplace = require("../../../middleware/uploadImageWithReplace");

const {
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
} = require("../../../controller/store/product/storeProductCTR");

// Base route
router.get("/", (req, res) => {
  res.send("Product routes working!");
});

// Protected Product Routes
router.post(
  "/store-product/create",
  common.tokenmiddleware,
  uploadImage.single("product_image"),
  asyncHandler(createProduct)
);
router.post(
  "/store-product/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteProduct)
);
router.put(
  "/store-product/update/:id",
  common.tokenmiddleware,
  uploadImageWithReplace("product_image"),
  asyncHandler(updateProduct)
);

router.get(
  "/store-product/product-history/:id",
  common.tokenmiddleware,
  asyncHandler(getProductHistory)
);
router.get(
  "/store-product/find-all/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(getAllProducts)
);
router.get(
  "/store-product/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findProductById)
);
router.get(
  "/store-product/search",
  common.tokenmiddleware,
  asyncHandler(searchProducts)
);

// Excel upload route
const upload = multer({ dest: "../../../assets/uploadProductExcel" });

router.post(
  "/store-product/upload-excel",
  common.tokenmiddleware,
  upload.single("excelFile"),
  excelParser,
  uploadExcelData
);
router.get(
  "/store-product/export-excel/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(exportProductsToExcel)
);

router.get(
  "/store-product/export-pdf/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(exportProductsToPDF)
);

module.exports = router;
