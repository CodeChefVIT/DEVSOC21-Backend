const nodemailer = require("nodemailer");
const aws = require("aws-sdk");
const fs = require("fs");
require("dotenv").config({
  path: "../../.env",
});
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});
let transporter = nodemailer.createTransport({
  SES: new aws.SES(),
});

exports.sendEmail = async function (from, to, subject, text) {
  await transporter
    .sendMail({
      from: `"CodeChef-VIT" ${from}`,
      to: to,
      subject: subject,
      // html: html,
      text: text,
      function(err, info) {
        if (err) {
          console.error(err);
        } else {
          console.log(info);
        }
      },
    })
    .then(() => {
      console.log("Success : ", to);
    })
    .catch(() => {
      console.log("Fail : ", to);
    });
};
