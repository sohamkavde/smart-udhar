var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");

const {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerById,
    getAllCustomers
} = require("../../../controller/store/customer/storeCustomerCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});
 

// // Protected Routes
router.post("/create-customer", common.tokenmiddleware, asyncHandler(createCustomer));
router.get("/find-all-customer", common.tokenmiddleware, asyncHandler(getAllCustomers));

router.post("/delete-customer/:customId", common.tokenmiddleware, asyncHandler(deleteCustomer));
router.put("/update-customer", common.tokenmiddleware, asyncHandler(updateCustomer));
router.put("/find-customer/:customId", common.tokenmiddleware, asyncHandler(findCustomerById));




module.exports = router;
