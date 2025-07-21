const storeModel = require("../../../models/store/auth/store");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_TOKEN_SECRET;

const moment = require("moment");
require("moment-timezone");
 
// // Assuming created_at is from DB
// const createdAt = "2025-07-21T06:53:31.371+00:00";

// // Format to IST with AM/PM
// const formattedDate = moment(createdAt)
//   .tz('Asia/Kolkata')
//   .format('DD-MM-YYYY hh:mm A');
//   console.log(formattedDate);
 

// Store Registration
const storeRegistration = async (req, res) => {
  try {
    const { mobile, otp, roles } = req.body;

    if (!mobile || !otp || !roles) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }

    const mobileStore = await storeModel.findOne({ mobile });
    if (mobileStore) {
      return res
        .status(400)
        .json({ status: "failed", message: "Mobile already exists" });
    }
    const mobile_otp = otp;
    const newStore = await new storeModel({
      mobile,
      mobile_otp,
      roles
    }).save();

    // sendEmailVerificationOTP(req, newStore);

    return res.status(201).json({
      status: "success",
      message: "Store Registration Successful",
      store: { id: newStore._id, email: newStore.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "Unable to Register, please try again later",
    });
  }
};

//Store Verification By mobile OTP
const storeVerificationByMobileOTP = async (req, res) => {
  try {
    const { mobile, otp, roles } = req.body;

    if (!mobile || !otp || !roles) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "Unable to Verify Mobile OTP, please try again later",
    });
  }
};

// // Verify Admin Email
// const verifyAdminEmail = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;

//     if (!mobile || !otp) {
//       return res
//         .status(400)
//         .json({ status: "failed", message: "All fields are required" });
//     }

//     const existingAdmin = await adminModel.findOne({ mobile });
//     if (!existingAdmin) {
//       return res
//         .status(404)
//         .json({ status: "failed", message: "Email doesn't exist" });
//     }

//     if (existingAdmin.is_verified) {
//       return res
//         .status(400)
//         .json({ status: "failed", message: "Email is already verified" });
//     }

//     const emailVerification = await emailVerificationModel.findOne({
//       userId: existingAdmin._id,
//       otp,
//     });
//     if (!emailVerification) {
//       await sendEmailVerificationOTP(req, existingAdmin);
//       return res.status(400).json({
//         status: "failed",
//         message: "Invalid OTP, new OTP sent to your email",
//       });
//     }

//     const expirationTime = new Date(
//       emailVerification.createdAt.getTime() + 15 * 60 * 1000
//     );
//     if (new Date() > expirationTime) {
//       await sendEmailVerificationOTP(req, existingAdmin);
//       return res.status(400).json({
//         status: "failed",
//         message: "OTP expired, new OTP sent to your email",
//       });
//     }

//     existingAdmin.is_verified = true;
//     existingAdmin.email_verified_at = new Date().toString();
//     await existingAdmin.save();

//     await emailVerificationModel.deleteMany({ userId: existingAdmin._id });

//     return res
//       .status(200)
//       .json({ status: "success", message: "Email verified successfully" });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ status: "failed", message: "Unable to verify email" });
//   }
// };

// // Resend Admin Verification Code
// const resendAdminVerificationCode = async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res
//       .status(400)
//       .json({ status: "failed", message: "Email is required" });
//   }

//   const admin = await adminModel.findOne({ email });
//   if (!admin) {
//     return res.status(404).json({ status: "failed", message: "Invalid Email" });
//   }

//   sendEmailVerificationOTP(req, admin);

//   return res.json({
//     status: "success",
//     message: "Verification code sent to your email.",
//   });
// };

// Store Login
const storeLogin = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res
        .status(400)
        .json({
          status: "failed",
          message: "Mobile and password are required",
        });
    }

    const store = await storeModel.findOne({ mobile, roles: "store" });
    if (!store) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid Mobile" });
    }

    if (!store.is_verified) {
      return res
        .status(401)
        .json({ status: "failed", message: "Your account is not verified" });
    }

    const payload = { _id: store._id };
    const token = jwt.sign(payload, jwt_secret, { expiresIn: "2h" });

    store.lastLogin = new Date().toString();
    await store.save();

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to login" });
  }
};

// Store Profile
const storeProfile = async (req, res) => {
  try {
    const store = await storeModel.findById(req.userId);
    return res.status(200).json({
      status: "success",
      message: "Data fetch successful",
      store,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to get store profile" });
  }
};

// Store Logout
const storeLogout = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Logout successful (client should clear token)",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to logout" });
  }
};

module.exports = {
  storeRegistration,
  storeLogin,
  storeProfile,
  storeLogout,
};
