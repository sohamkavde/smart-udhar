const path = require("path");

const storeModel = require(path.join(__dirname,"../../../models/store/auth/store"));

const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_TOKEN_SECRET;

const moment = require("moment-timezone");


// Store Registration
const storeRegistration = async (req, res) => {
  try {
    const { mobile, roles } = req.body;

    if (!mobile || !roles) {
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
   const mobile_otp = Math.floor(100000 + Math.random() * 900000).toString();
     
    const newStore = await new storeModel({
      mobile,
      mobile_otp,
      roles,
    }).save();

    // send otp for registration verification
    // // sendMobileVerification(otp,newStore);
 

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
      error: error.message,
    });
  }
};

// Store Verification By mobile OTP
const storeVerificationByMobileOTP = async (req, res) => {
  try {
    const { mobile, mobile_otp } = req.body;

    if (!mobile || !mobile_otp) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    const mobileStore = await storeModel.findOne({ mobile });

    if (!mobileStore) {
      return res.status(404).json({
        status: "failed",
        message: "Mobile number not registered",
      });
    }

    if (mobileStore.is_verified) {
      return res.status(400).json({
        status: "failed",
        message: "Account is already verified",
      });
    }

    // Check if OTP is expired (older than 2 days)
    const createdAt = moment(mobileStore.created_at).tz("Asia/Kolkata");
    const now = moment().tz("Asia/Kolkata");
    const diffInDays = now.diff(createdAt, "days");

    if (diffInDays > 2) {
      return res.status(400).json({
        status: "failed",
        message: "OTP expired. Please click on resent OTP",
      });
    }

    // Below logic check otp is equal or not
    if (mobileStore.mobile_otp !== mobile_otp) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid OTP",
      });
    }

    const payload = { _id: mobileStore._id };
    const token = jwt.sign(payload, jwt_secret, { expiresIn: "2h" });

    // OTP is valid and within time limit
    mobileStore.is_verified = true;
    mobileStore.mobile_otp = "";
    await mobileStore.save();

    return res.status(200).json({
      status: "success",
      message: "Mobile number verified successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "Unable to Verify Mobile OTP, please try again later",
    });
  }
};

// send otp for already exist store (entity)
const storeLoginOTP = async (req, res) => {
  try {
    const { mobile, roles } = req.body;
    if (!mobile || !roles) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    const store = await storeModel.findOne({ mobile, roles });

    if (!store) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid Mobile and roles" });
    }

    if (!store.is_verified) {
      return res
        .status(401)
        .json({ status: "failed", message: "Your account is not verified" });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // code to send mobile otp
    // sendMobiileVerification(otp,store);
    
    // OTP is valid and within time limit
    store.mobile_otp = otp;
    await store.save();

    return res.status(201).json({
        status: "success",
        message: "OTP Sent to mobile number"        
    });


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "Unable to Verify Mobile OTP, please try again later",
    });
  }
};

// Store Login using mobile otp verification
const storeLoginVerified = async (req, res) => {
  try {
    const { mobile, roles, mobile_otp } = req.body;
    if (!mobile || !roles || !mobile_otp) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    const store = await storeModel.findOne({ mobile, roles, mobile_otp });
    if (!store) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid Data" });
    }
     

    const payload = { _id: store._id };
    const token = jwt.sign(payload, jwt_secret, { expiresIn: "2h" });

    store.mobile_otp = "";
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

// Store Logout, to logout clear token at client side
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
  storeVerificationByMobileOTP,
  storeLoginOTP,
  storeLoginVerified,

  storeProfile,
  storeLogout,
};
