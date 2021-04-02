const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = npmrequire("cookie-parser");
const User = require("../api/models/user");

const router = express.Router();

router.use(cookieParser());
require("dotenv").config();
const axios = require("axios");

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const getGoogleAuthURL = () => {
  /*
   * Generate a url that asks permissions to the user's email and profile
   */
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
    "openid",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes, // If you only need one scope you can pass it as string
  });
};

router.get("/google", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(error.message);
    });
  // Check for user in our database
  console.log(googleUser);
  // return res.status(200).json({
  //   googleUser
  // });
  const user = await User.findOne({ email: googleUser.email });
  if (user) {
    //Create JWT for user
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    user.login_count += 1;
    await user
      .save()
      .then((user) => {
        console.log("hllo")
        res.status(200).json({
          user,
          token,
        });
      })
      .catch((err) => {
        res.status(200).json({
          message: "Server Error",
          error: err.toString(),
          success: false,
        });
      });
  } else {
    // Create User and his subsequent fields
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.picture,
    });
    await user
      .save()
      .then(async (user) => {
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            name: user.name,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );
        console.log("hllo")
        res.status(200).json({
          user,
          token,
        });
      })
      .catch((err) => {
        res.status(200).json({
          message: "Server Error",
          error: err.toString(),
          success: false,
        });
      });
  }
});

router.get("/getURL", (req, res) => {
  const URL = getGoogleAuthURL();
  if (URL) {
    res.status(200).json({
      success: true,
      data: URL,
      message: "Retrieved URL successfully",
    });
  } else {
    res.status(200).json({
      success: false,
      message: "error in retrieving URL",
    });
  }
});

module.exports = router;
