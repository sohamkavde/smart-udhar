const transporter = require("../helper/mailhelper");
const EmailVerificationModel = require ("../models/EmailVerification");

const sendEmailVerificationOTP = async (req, user) => {
  // Generate a random 4-digit number
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Save OTP in Database
  await new EmailVerificationModel({ userId: user._id, otp: otp }).save();
  
  //set url according to roles (Store or user)
  let Host_URL = process.env.FRONTEND_HOST;
  if(user.roles == "store"){
      Host_URL = process.env.FRONTEND_HOST_STORE;
  }
  //  OTP Verification Link
  const otpVerificationLink = `${process.env.FRONTEND_HOST}/otp/${user.email}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP - Verify your account",
    html: `<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP): <a href="${otpVerificationLink}" target="_blank">verify here</a> </p>
    <h2>OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`
  })

  return otp
}

module.exports = sendEmailVerificationOTP