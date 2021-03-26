const User = require("../models/user");
const mongoose = require("mongoose");

exports.update = async (req, res) => {
  const { userId } = req.user;
  // console.log(teamId)
  update = req.body;
  User.findOneAndUpdate({ _id: userId }, update)
    .then((user) => {
      res.status(201).json({
        message: "Updated successfully",
      });
    })
    .catch((e) => {
      res.status(400).json({
        error: e.toString(),
      });
    });
};
