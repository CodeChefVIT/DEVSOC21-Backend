const Team = require("../models/team");
const User = require("../models/user");
const mongoose = require("mongoose");
const user = require("../models/user");
const team = require("../models/team");
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
exports.login = async (req,res) => {
 const {email,password} = req.body
 if(password && email){
 var hash = crypto.createHash('md5').update(password).digest('hex');
// console.log(hash); 
  if(email==process.env.ADMIN_EMAIL){
    if(hash==process.env.ADMIN_PASSWORD){
      const token = jwt.sign(
        {
          email: email,
          lol:"lmao"
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      return res.status(200).json({
        success:true,
        token
      })
    }
    else{
      return res.status(403).json({
        success:false,
        message:"Incorrect Password"
      })
    }
  }
  else{
    return res.status(403).json({
      success:false,
      message:"Incorrect email"
    })
  }
 } 

}

exports.displayAll = async (req, res) => {
  Team.find({})
    .populate({ path: "leader", select: "_id name" })
    .populate({ path: "users", select: "_id name email" })
    .select("-code -idea -avatar -submission -updatedAt -__v ")
    .then((teams) => {
      res.status(200).json({
        teams,
      });
    })
    .catch((e) => {
      res.status(500).json({
        error: e.toString(),
      });
    });
};

exports.submissionById = async (req,res)=>{
  const {teamId} = req.body
  await Team.findById(teamId).then((team)=>{
  res.status(200).json({
    team
  })
  })
}

exports.submissionByName = async (req,res)=>{
  const {name} = req.body
  await Team.find({name}).then((team)=>{
  res.status(200).json({
    team
  })
  })
}

exports.submissionStatus = async (req,res)=>{
  const {status,teamId} = req.body
  if(teamId){
  await Team.updateOne({_id:teamId},{submission:{status:status}}).then(()=>{
    res.status(201).json({
      message:"Updated"
    })
  })
    .catch((e)=>{
      res.status(500).json({
        error:e.toString()
      })
    })}
    else{
      return res.status(404).json({
        message:"Teamid not found"
      })
    }
}