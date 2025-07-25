const StoreStaff = require("../../../models/store/staff/storeStaffModel");
const moment = require("moment-timezone");

// @desc    Create staff
// @route   POST /store-staff/create
const createStaff = async (req, res) => {
  try {
    const data = req.body;

    const staff = new StoreStaff({
      firstName: data.firstName,
      lastName: data.lastName,
      mobileNumber: data.mobileNumber,
      emailId: data.emailId,
      address: data.address,
      pinNumber: data.pinNumber,
      city: data.city,
      state: data.state,
      roles: data.roles || [],
      image: data.image || "",
      status: data.status || "active",
      online: data.online || false,
      createdAt: moment().tz("Asia/Kolkata").toDate(),
    });

    await staff.save();
    res.status(201).json({ success: true, message: "Staff created", staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all staff for a store
// @route   GET /store-staff/find-all/:store_id/:storeProfile_id
const getAllStaff = async (req, res) => {
  try {
    const { store_id, storeProfile_id } = req.params;

    const staffList = await StoreStaff.find({ store_id, storeProfile_id }).sort(
      { createdAt: -1 }
    );

    res
      .status(200)
      .json({ success: true, count: staffList.length, staff: staffList });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete staff by ID
// @route   DELETE /store-staff/delete/:id
const deleteStaff = async (req, res) => {
  try {
    const _id = req.params.id;

    const staff = await StoreStaff.findByIdAndDelete(_id);

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update staff details
// @route   PUT /store-staff/update
const updateStaff = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const _id = id;

    const staff = await StoreStaff.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        updatedAt: moment().tz("Asia/Kolkata").toDate(),
      },
      { new: true }
    );

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.status(200).json({ success: true, message: "Staff updated", staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Find staff by ID
// @route   GET /store-staff/findBy-id/:id
const findStaffById = async (req, res) => {
  try {
    const _id = req.params.id;

    const staff = await StoreStaff.findById(_id);

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.status(200).json({ success: true, staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createStaff,
  updateStaff,
  deleteStaff,
  findStaffById,
  getAllStaff,
};
