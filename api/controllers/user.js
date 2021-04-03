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
  let user = await User.aggregate(
    [
      {
        $match : { _id: { $eq: mongoose.Types.ObjectId(userId) } },
      },
      {
        $lookup: {
          from: "teams",
          localField: "team",
          foreignField: "_id",
          as: "team",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          mobile: 1,
          college: 1,
          avatar: 1,
          bio: 1,
          "team._id": 1,
          "team.name": 1,
          "team.code": 1,
        },
      },
    ]
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