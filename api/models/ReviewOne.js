const mongoose = require("mongoose");

const formSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    users: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    teamName: {type: String},

    leaderNumber: {type: String},

    leaderName: { type: String },

    track: { type: String},

    extraPrizes: {type: Array},
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewOne", formSchema);
