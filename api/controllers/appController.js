const User = require("../models/user");
var otpGenerator = require("otp-generator");
const { sendEmail } = require("../../config/emailScript");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ReviewOne = require("../models/ReviewOne");

let announcements = [
  {
    title: "Welcome to DEVSOC'21",
    body: "We are thrilled to have you on board with us at DEVSOC'21",
    link: "https://hackwith.codechefvit.com",
  },
];

function convertTZ(date) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );
}

const form = {
  title: "Review One Form",
  questions: [
    {
      question: "team name",
      type: "textfield",
      value: null,
      key: "teamName",
    },
    {
      question: "Leader Name",
      type: "textfield",
      value: null,
      key: "leaderName",
    },
    {
      question: "Leader Number",
      type: "textfield",
      value: null,
      key: "leaderNumber",
    },
    {
      question: "Track",
      type: "dropdown",
      dropdownOptions: [
        "track 1",
        "track 2",
        "track 3",
        "track 4",
        "track 5",
        "track 6",
      ],
      value: null,
      key: "track",
    },
    {
      question: "extra prizes",
      type: "checkbox",
      checkboxOptions: [
        "Extra prize 1",
        "Extra prize 2",
        "Extra prize 3",
        "Extra prize 4",
        "Extra prize 5",
      ],
      value: [],
      key: "extraPrizes",
    },
  ],
};

exports.getAppStatus = () => {
  const d = convertTZ(new Date());
  let date = d.getDate();
  let today = 2;
  if (date == 30) {
    today = 1;
  } else if (date == 1) {
    today = 2;
  } else if (date == 2) {
    today = 3;
  } else {
    today = 2;
  }
  const data = {
    today: today,
    day1: [
      {
        title: "Backend",
        start: "2021-04-10 05:00:00",
        end: "2021-04-10 09:00:00",
        startVal: 5,
        duration: 4,
      },
      {
        title: "Happy boyu hours",
        start: "2021-04-10 12:00:00",
        end: "2021-04-10 14:00:00",
        startVal: 12,
        duration: 2,
      },
      {
        title: "Idea submission",
        start: "2021-04-10 18:00:00",
        end: "2021-04-10 20:00:00",
        startVal: 18,
        duration: 2,
      },
    ],
    day2: [
      {
        title: "TL T main",
        start: "2021-04-11 01:00:00",
        end: "2021-04-11 02:00:00",
        startVal: 1,
        duration: 1,
      },
      {
        title: "CodEd Hours",
        start: "2021-04-11 04:00:00",
        end: "2021-04-11 06:00:00",
        startVal: 4,
        duration: 2,
      },
      {
        title: "DEVSOC Hours",
        start: "2021-04-11 14:00:00",
        end: "2021-04-11 17:00:00",
        startVal: 14,
        duration: 3,
      },
      {
        title: "Siddharth Hours",
        start: "2021-04-11 20:00:00",
        end: "2021-04-11 23:00:00",
        startVal: 20,
        duration: 3,
      },
    ],
    day3: [
      {
        title: "Talk on GO",
        start: "2021-04-12 07:00:00",
        end: "2021-04-12 10:00:00",
        startVal: 7,
        duration: 3,
      },
      {
        title: "EPIC SHIT",
        start: "2021-04-12 18:00:00",
        end: "2021-04-12 20:00:00",
        startVal: 18,
        duration: 2,
      },
      {
        title: "Review 2",
        start: "2021-04-12 11:00:00",
        end: "2021-04-12 12:00:00",
        startVal: 11,
        duration: 1,
      },
      {
        title: "Something",
        start: "2021-04-12 14:00:00",
        end: "2021-04-12 15:30:00",
        startVal: 14,
        duration: 1.5,
      },
    ],
  };
  return data;
};

exports.getAppOTP = async (req, res) => {
  let { email } = req.body;
  email = email.trim();
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  } else {
    if (user.numOtpLogins >= 1) {
      return res.status(409).json({
        message: "Sorry too much spam",
        success: false,
      });
    } else {
      const otp = otpGenerator.generate(6, {
        digits: false,
        upperCase: false,
        specialChars: false,
        alphabets: true,
      });
      let currentNumOtp = user.numOtpLogins || 0;
      var createdDate = new Date();
      var expiryDate = new Date();
      expiryDate.setTime(createdDate.getTime() + 2 * 60 * 1000);
      await User.updateOne(
        { _id: user._id },
        {
          numOtpLogins: currentNumOtp + 1,
          otpTimestamp: Date.now(),
          currentOtp: otp,
          otpExpiryTimestamp: expiryDate,
        }
      )
        .then(async (result) => {
          //// SEND EMAIL
          await sendEmail(
            process.env.SES_EMAIL,
            user.email,
            `OTP for App Login`,
            otp
          );
          return res.status(200).json({
            message: "OTP Sent",
            success: true,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            success: false,
            message: "Server Error",
            err: err.toString(),
          });
        });
    }
  }
};

exports.checkAppOTP = async (req, res) => {
  const { otp, email } = req.body;
  const user = await User.findOne({ currentOtp: otp, email });
  if (!user) {
    res.status(401).json({
      message: "Invalid OTP",
      success: false,
    });
  } else {
    if (
      user.otpExpiryTimestamp < Date.now() ||
      user.otpExpiryTimestamp == null
    ) {
      await User.updateOne(
        { _id: user._id },
        {
          currentOtp: null,
          otpExpiryTimestamp: null,
          otpTimestamp: null,
          numOtpLogins: 0,
        }
      );
      res.status(402).json({
        message: "OTP expired",
        success: false,
      });
    } else {
      // Generate JWT and send
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          currentOtp: null,
          fcmToken = req.body.fcmToken
        }
      )
        .then((result) => {
          res.status(200).json({
            message: "Successful login",
            success: true,
            token,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            success: false,
            message: "Server Error",
            err: err.toString(),
          });
        });
    }
  }
};

exports.getAppProfile = async (req, res) => {
  const { userId } = req.user;
  await User.findById(userId)
    .populate({ path: "team", select: "_id name submission" })
    .select(" _id name email team personal bio avatar")
    .then((user) => {
      return res.status(200).json({
        success: true,
        user,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "Server Error",
        err: err.toString(),
      });
    });
};

exports.getAnnouncements = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      announcements,
      err: err.toString(),
    });
  }
};

exports.changeAnnouncements = async (req, res) => {
  announcements = req.body.announcements;
  res.send("ok");
};

exports.getForm = async (req, res) => {
  res.status(200).json({ form });
};

exports.submitform = async (req, res) => {
  const { questions } = req.body;
  const { userId } = req.user;
  const user = await User.findById(userId);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User doesnt exist",
    });
  }
  if (user && Date.now() < user.formSubmitTimeExpiry) {
    return res.status(402).json({
      success: false,
      message: "Please wait for 2 minutes before submitting the form again",
      messageHacker: "No DDoS here",
    });
  }
  const object = {};
  for (let question of questions) {
    object[question.key] = `${question.value}`;
  }
  object.userId = userId;
  object._id = new mongoose.Types.ObjectId();
  var createdDate = new Date();
  var expiryDate = new Date();
  expiryDate.setTime(createdDate.getTime() + 2 * 60 * 1000);
  await User.updateOne({ _id: userId }, { formSubmitTimeExpiry: expiryDate })
    .then(async (result) => {
      var id = mongoose.Types.ObjectId(userId)
      const reviewOne = await ReviewOne.find({ userId: id });
      console.log(reviewOne)
      if (reviewOne.length >= 1) {
        await ReviewOne.deleteMany({ userId: id });
      }
      const form = new ReviewOne(object);
      await form
        .save()
        .then((result) => {
          res.status(200).json({
            success: true,
            message: "Form saved successfully",
          });
        })
        .catch((err) => {
          return res.status(500).json({
            success: false,
            message: "Server Error",
            err: err.toString(),
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "Server Error",
        err: err.toString(),
      });
    });
};
