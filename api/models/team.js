const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: { type: String },

    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    code: { type: String, unique: true },

    submission: {
    name:{type:String},
    description: { type: String },
    status:{type:String},
    techStack:{type:String},
    link:{type:String},
    zip:{type:String}
  },

    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    avatar: {
      type: String,
      default: "",
    },

    
    finalised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
