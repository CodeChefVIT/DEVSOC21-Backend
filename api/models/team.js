const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: { type: String },

    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    code: { type: String, unique: true },

    idea: { type: String },

    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    avatar: {
      type: String,
      default: "",
    },

    submission: {
      type: String,
      default: null,
    },
    finalised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
