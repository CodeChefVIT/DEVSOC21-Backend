const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: { type: String },

    googleId: { type: String },

    email: { type: String },

    mobile: { type: Number },

    avatar: {
      type: String,
      default: "",
    },

    college: { type: String },

    bio: { type: String },

    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

    resume: { type: String },

    isCheckedIn: { type: Boolean },

    inTeam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
