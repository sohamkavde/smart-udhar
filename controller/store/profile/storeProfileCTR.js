const storeModel = require("../../../models/store/auth/store");

const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_TOKEN_SECRET;

const moment = require("moment-timezone");

const updateStore = async (req , res)=>{
    try{

    }catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to update profile" });
  }
};

module.exports = {
 updateStore,
  
};
