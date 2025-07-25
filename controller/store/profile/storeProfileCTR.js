const Profile = require("../../../models/store/profile/profile");
const moment = require("moment-timezone");

// Create Profile
const createProfile = async (req, res) => {
  try {
    const {
      businessName,
      gstNumber,
      address,
      pincode,
      mobile1,
      email,
      shortBio,
      industry,
      fbURL,
      twitterURL,
      linkedInURL,
      instagramURL,
      websiteURL,
      signatureImage,
      logoImage,
      store_id,
    } = req.body;

    // Basic validation (can be enhanced)
    if (
      !businessName ||
      !address ||
      !pincode ||
      !mobile1 ||
      !email ||
      !industry ||
      !store_id
    ) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newProfile = new Profile({
      businessName,
      gstNumber,
      address,
      pincode,
      mobile1,
      email,
      shortBio,
      industry,
      fbURL,
      twitterURL,
      linkedInURL,
      instagramURL,
      websiteURL,
      signatureImage,
      logoImage,
      store_id,
      created_at: moment().tz("Asia/Kolkata").toDate(),
      updated_at: moment().tz("Asia/Kolkata").toDate(),
    });

    await newProfile.save();

    return res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const updateData = req.body;

    updateData.updated_at = moment().tz("Asia/Kolkata").toDate();

    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const findProfileById = async (req, res) => {
  try {
    const profileId = req.params.id;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Error finding profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const findAllProfiles = async (req, res) => {
  try {
    // :store_id/:storeProfile_id
     const store_id = req.params.store_id; 

    const profiles = await Profile.find({ store_id }).sort({ created_at: -1 });
    const totalCount = await Profile.countDocuments({ store_id });

    return res.status(200).json({
      status: "success",
      message: "All profiles retrieved successfully",
      total: totalCount,
      data: profiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};



const deleteProfileById = async (req, res) => {
  try {
    const profileId = req.params.id;

    const deletedProfile = await Profile.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile deleted successfully",
      data: deletedProfile,
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


module.exports = {
  createProfile,
  updateProfile,
  findProfileById,
  findAllProfiles,
  deleteProfileById,
};

