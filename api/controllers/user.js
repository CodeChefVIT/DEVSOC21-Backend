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
      res.status(500).json({
        error: e.toString(),
      });
    });
};


exports.getProfile = async (req, res)=>{
  const { userId } = req.user;
  let user = await User.findById(userId)
  )
    if(user){
      user = Object(user[0])
      if(user.team && user.team.length >=1){
        user.team = user.team[0]
      }
      res.status(200).json({
        success: true,
        user
      })
    }else{
      req.status(404).json({
        success: false,
        message: "Does not exist"
      })
    }
}