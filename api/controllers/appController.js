const User = require("../models/user");
var otpGenerator = require("otp-generator");
const { sendEmail } = require("../../config/emailScript");
const jwt = require("jsonwebtoken");

let announcements = [
  {
    title: "Welcome to DEVSOC'21",
    body:
      "We are thrilled to have you on board with us at DEVSOC'21",
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

exports.getAppStatus = () => {
  const d = convertTZ(new Date());
  let date = d.getDate();
  let today = 3;
  if (date == 30) {
    today = 1;
  } else if (date == 1) {
    today = 2;
  } else {
    today = 3;
  }
  const data = {
    today: today,
    day1: [
      {
        title: "Backend",
        start: "2021-04-05 01:00:00",
        end: "2021-04-05 04:00:00",
        startVal: 1,
        duration: 3,
      },
      {
        title: "Sad Boy Hours",
        start: "2021-04-05 05:00:00",
        end: "2021-04-05 06:00:00",
        startVal: 5,
        duration: 1,
      },
      {
        title: "Review 1",
        start: "2021-04-05 10:00:00",
        end: "2021-04-05 12:00:00",
        startVal: 10,
        duration: 2,
      },
      {
        title: "CodeChef Hours",
        details: "Some details, lorem ipsaum",
        start: "2021-04-05 14:00:00",
        end: "2021-04-05 15:30:00",
        startVal: 14,
        duration: 1.5,
      },
      {
        title: "TL T",
        start: "2021-04-05 22:00:00",
        end: "2021-04-05 23:00:00",
        startVal: 22,
        duration: 1,
      },
    ],
    day2: [
      {
        title: "Talk on Blockchain by Pranjal",
        start: "2021-04-06 01:00:00",
        end: "2021-04-06 02:00:00",
        startVal: 1,
        duration: 1,
      },
      {
        title: "Naseeb life",
        start: "2021-04-06 05:00:00",
        end: "2021-04-06 06:00:00",
        startVal: 5,
        duration: 1,
      },
      {
        title: "Technical Meet",
        start: "2021-04-06 10:00:00",
        end: "2021-04-06 12:00:00",
        startVal: 10,
        duration: 2,
      },
      {
        title: "TL T",
        start: "2021-04-06 14:00:00",
        end: "2021-04-06 15:30:00",
        startVal: 14,
        duration: 1.5,
      },
    ],
    day3: [
      {
        title: "Talk on NODE",
        start: "2021-04-07 01:00:00",
        end: "2021-04-07 03:00:00",
        startVal: 1,
        duration: 2,
      },
      {
        title: "NO THIS IS EPIC",
        start: "2021-04-07 09:00:00",
        end: "2021-04-07 10:00:00",
        startVal: 9,
        duration: 1,
      },
      {
        title: "Review 2",
        start: "2021-04-07 11:00:00",
        end: "2021-04-07 12:00:00",
        startVal: 11,
        duration: 1,
      },
      {
        title: "Something",
        start: "2021-04-07 14:00:00",
        end: "2021-04-07 15:30:00",
        startVal: 14,
        duration: 1.5,
      },
    ],
  };
  return data;
};

exports.getAppOTP = async (req, res) => {
  const { email } = req.body;
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
    if (user.otpExpiryTimestamp < Date.now() || user.otpExpiryTimestamp == null) {
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


exports.changeAnnouncements = async(req,res) => {
   announcements = req.body.announcements
   res.send('ok')
}