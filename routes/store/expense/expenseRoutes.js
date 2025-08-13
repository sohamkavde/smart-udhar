var express = require("express");
var router = express.Router();
const asyncHandler = require("../../../middleware/async");
const common = require("../../../helper/common");
const exportToExcel = require("../../../middleware/expense/exportExcel");
const exportToPDF = require("../../../middleware/expense/exportPDF");

const {
  createExpense,
  updateExpense,
  deleteExpense,
  findExpenseById,
  getAllExpenses,
  filterExpenses,
  exportExpenses,
  exportExpensesPDF,
} = require("../../../controller/store/expense/storeExpenseCTR");

// Protected Routes
router.post(
  "/store-expense/create",
  common.tokenmiddleware,
  asyncHandler(createExpense)
);
router.get(
  "/store-expense/find-all/:store_id/:storeProfile_id",
  common.tokenmiddleware,
  asyncHandler(getAllExpenses)
);
router.put(
  "/store-expense/update/:id",
  common.tokenmiddleware,
  asyncHandler(updateExpense)
);
router.delete(
  "/store-expense/delete/:id",
  common.tokenmiddleware,
  asyncHandler(deleteExpense)
);
router.get(
  "/store-expense/findBy-id/:id",
  common.tokenmiddleware,
  asyncHandler(findExpenseById)
);
router.post(
  "/store-expense/filter",
  common.tokenmiddleware,
  asyncHandler(filterExpenses)
);

// export excel
router.get(
  "/store-expense/export-excel",
  common.tokenmiddleware,
  asyncHandler(exportExpenses),
  exportToExcel
);

router.get(
  "/store-expense/export-pdf",
  common.tokenmiddleware,
  asyncHandler(exportExpensesPDF),
  exportToPDF
);

module.exports = router;
