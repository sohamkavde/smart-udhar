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
} = require("../../../controller/store/profile/storeCustomerCTR");

/* GET users listing. */
router.get("/", function (req, res, next) {});
 

// // Protected Routes
router.post("/create-customer", common.tokenmiddleware, asyncHandler(createCustomer));
router.put("/delete-customer", common.tokenmiddleware, asyncHandler(deleteCustomer));
router.put("/find-all-customer", common.tokenmiddleware, asyncHandler(getAllCustomers));

router.put("/update-customer/:id", common.tokenmiddleware, asyncHandler(updateCustomer));
router.put("/find-customer/:id", common.tokenmiddleware, asyncHandler(findCustomerById));




module.exports = router;
