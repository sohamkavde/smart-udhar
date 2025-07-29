const Expense = require("../../../models/store/ExpenseModel"); // Adjust path as needed
const moment = require("moment-timezone");

// Create a new expense
const createExpense = async (req, res) => {
  const {
    date,
    expenseCategory,
    itemName,
    amount,
    vendorName,
    gstApplicable,
    paymentMode,
    notesOrBill,
    expenseImage,
    store_id,
    storeProfile_id
  } = req.body;

  const newExpense = new Expense({
    date,
    expenseCategory,
    itemName,
    amount,
    vendorName,
    gstApplicable,
    paymentMode,
    notesOrBill,
    expenseImage,
    store_id,
    storeProfile_id,
    createdAt: moment.tz("Asia/Kolkata").toDate(),
    updatedAt: moment.tz("Asia/Kolkata").toDate()
  });

  await newExpense.save();
  res.status(201).json({ success: true, data: newExpense });
};

// Get all expenses for a store and profile
const getAllExpenses = async (req, res) => {
  const { store_id, storeProfile_id } = req.params;

  const expenses = await Expense.find({
    store_id,
    storeProfile_id
  }).sort({ date: -1 });

  res.status(200).json({ success: true, data: expenses });
};

// Update an expense
const updateExpense = async (req, res) => {
  const _id = req.params.id;
  const updateData = req.body;

  updateData.updatedAt = moment.tz("Asia/Kolkata").toDate();

  const updated = await Expense.findByIdAndUpdate(_id, updateData, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: "Expense not found" });
  }

  res.status(200).json({ success: true, data: updated });
};

// Delete an expense
const deleteExpense = async (req, res) => {
  const _id = req.params.id;

  const deleted = await Expense.findByIdAndDelete(_id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Expense not found" });
  }

  res.status(200).json({ success: true, message: "Expense deleted successfully" });
};

// Find an expense by ID
const findExpenseById = async (req, res) => {
  const _id = req.params.id;

  const expense = await Expense.findById(_id);

  if (!expense) {
    return res.status(404).json({ success: false, message: "Expense not found" });
  }

  res.status(200).json({ success: true, data: expense });
};

module.exports = {
  createExpense,
  updateExpense,
  deleteExpense,
  findExpenseById,
  getAllExpenses,
};
