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

module.exports = { createProfile,updateProfile };
