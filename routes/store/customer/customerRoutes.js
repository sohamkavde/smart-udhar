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
router.post("/store-customer/create", common.tokenmiddleware, asyncHandler(createCustomer));
router.get("/store-customer/find-all", common.tokenmiddleware, asyncHandler(getAllCustomers));

router.post("/store-customer/delete/:customId", common.tokenmiddleware, asyncHandler(deleteCustomer));
router.put("/store-customer/update", common.tokenmiddleware, asyncHandler(updateCustomer));
router.put("/store-customer/findBy-id/:customId", common.tokenmiddleware, asyncHandler(findCustomerById));




module.exports = router;
