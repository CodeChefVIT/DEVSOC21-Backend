const mongoose = require("mongoose");

const likesSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    count : {type:Number,default:0},
    teamId : {type:mongoose.Schema.Types.ObjectId,ref:"Team"}
    
  },
);

module.exports = mongoose.model("Like", likesSchema);
