const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: { type: String },

    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    code: { type: String, unique: true },

    submission: {
      name: { type: String },
      description: { type: String },
      track: { type: String, default: "Open Innovation" },
      finalName: { type: String },
      finalDescription: { type: String },
      finalTrack: { type: String, default: "Open Innovation" },
      status: { type: String, default: "Not Submitted" },
      techStack: { type: String },
      githubLink: { type: String },
      videolink: { type: String },
      zip: { type: String },
      tags: { type: Array },
    },

    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    avatar: {
      type: String,
      default: "",
    },

    invitedTeammates: [{ type: String }],
    finalised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
