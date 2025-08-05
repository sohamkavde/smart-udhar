const { default: mongoose } = require("mongoose");
const StoreStaff = require("../../../models/store/staff/storeStaffModel");
const moment = require("moment-timezone");

// @desc    Create staff
// @route   POST /store-staff/create
const createStaff = async (req, res) => {
  try {
    const data = req.body;

    const imagePath = req.file ? `${req.file.filename}` : "";

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
      image: imagePath,
      status: data.status || "active",
      online: data.online || false,
      store_id: data.store_id,
      storeProfile_id: data.storeProfile_id,
      createdAt: moment().tz("Asia/Kolkata").toDate(),
    });

    await staff.save();
    res.status(201).json({ success: true, message: "Staff created", staff });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc    Get all staff for a store
// @route   GET /store-staff/find-all/:store_id/:storeProfile_id
const getAllStaff = async (req, res) => {
  try {
    const { store_id, storeProfile_id } = req.params;
    const { page = 1, limit = 10 } = req.body; // default: page 1, 10 items

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch paginated data
    const staffList = await StoreStaff.find({ store_id, storeProfile_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Fetch total count (for frontend pagination controls)
    const totalCount = await StoreStaff.countDocuments({ store_id, storeProfile_id });

    res.status(200).json({
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      count: staffList.length,
      totalCount,
      staff: staffList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
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
    const _id = req.params.id;
    const {...updateData} =  req.body;   

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


// @desc    Find staff by partial first and/or last name
// @route   GET /store-staff/findBy-name?firstName=jo&lastName=do
const findStaffByName = async (req, res) => {
  try {
    const { store_id, storeProfile_id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required for search",
      });
    }

    const words = name.trim().split(/\s+/);
    const regexWords = words.map(word => new RegExp(word, 'i'));

    let searchQuery = [];

    if (regexWords.length === 1) {
      // Match either firstName or lastName
      searchQuery = [
        { firstName: regexWords[0] },
        { lastName: regexWords[0] },
      ];
    } else {
      // Match combinations of firstName and lastName
      searchQuery = [
        { firstName: regexWords[0], lastName: regexWords[1] },
        { firstName: regexWords[1], lastName: regexWords[0] },
      ];
    }

    const staff = await StoreStaff.find({
      store_id,
      storeProfile_id,
      $or: searchQuery,
    });

    if (!staff.length) {
      return res
        .status(404)
        .json({ success: false, message: "No matching staff found" });
    }

    res.status(200).json({ success: true, total: staff.length, staff });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
 

 

const findStaffDetails = async (req, res) => {
  try {
    const { store_id, storeProfile_id } = req.params;

    // ✅ Convert to ObjectId
    const matchQuery = {
      store_id: new mongoose.Types.ObjectId(store_id),
      storeProfile_id: new mongoose.Types.ObjectId(storeProfile_id),
    };

    // Total, Active, Online counts
    const [total, active, online] = await Promise.all([
      StoreStaff.countDocuments(matchQuery),
      StoreStaff.countDocuments({ ...matchQuery, status: "active" }),
      StoreStaff.countDocuments({ ...matchQuery, online: true }),
    ]);

    // Role aggregation
    const roleAggregation = await StoreStaff.aggregate([
      { $match: matchQuery },
      { $unwind: "$roles" },
      {
        $group: {
          _id: "$roles",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const roles = {};
    roleAggregation.forEach((role) => {
      roles[role._id] = role.count;
    });

    res.status(200).json({
      success: true,
      totalStaff: total,
      activeStaff: active,
      onlineStaff: online,
      roleDistribution: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



module.exports = {
  createStaff,
  updateStaff,
  deleteStaff,
  findStaffById,
  getAllStaff,
  findStaffByName,
  findStaffDetails
};
