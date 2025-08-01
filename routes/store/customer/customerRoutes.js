var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");
const customerExcelParser = require("../../../middleware/customerExcelParser");
const multer = require("multer");

const {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerById,
    getAllCustomers,
    uploadExcelData,
    // exportProductsToExcel
} = require("../../../controller/store/customer/storeCustomerCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});
 

// // Protected Routes
router.post("/store-customer/create", common.tokenmiddleware, asyncHandler(createCustomer));
router.get("/store-customer/find-all/:store_id/:storeProfile_id", common.tokenmiddleware, asyncHandler(getAllCustomers));

router.post("/store-customer/delete/:id", common.tokenmiddleware, asyncHandler(deleteCustomer));
router.put("/store-customer/update", common.tokenmiddleware, asyncHandler(updateCustomer));
router.put("/store-customer/findBy-id/:id", common.tokenmiddleware, asyncHandler(findCustomerById));


// Excel upload route
const upload = multer({ dest: "../../../assets/uploadCustomerExcel" });
router.post("/store-customer/upload-excel", common.tokenmiddleware, upload.single("excelFile"), customerExcelParser, uploadExcelData);
// router.get("/store-customer/export-excel/:store_id/:storeProfile_id", common.tokenmiddleware, asyncHandler(exportProductsToExcel));



module.exports = router;
