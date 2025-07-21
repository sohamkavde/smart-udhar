const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  secure: false,
  port: process.env.EMAIL_PORT,
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendEMail = function (mailRequest) {
  console.log(mailRequest, "=-==-=-=-mailRequest-=-=");
  return new Promise(function (resolve, reject) {
    transporter.sendMail(mailRequest, (error, info) => {
      console.log(error, "=-==-=-=-errorerrorerror-=-=");
      console.log(info, "=-==-=-=-infoinfoinfo-=-=");

      if (error) {
        reject(error);
      } else {
        resolve("The message was sent!");
      }
    });
  });
};

module.exports = transporter;
