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

    address: {
      line1: { type: String },
      line2: { type: String },
      pincode: { type: Number },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    personal: {
      github: { type: String },
      linkedin: { type: String },
      discord: {
        nickname: { type: String },
        hash: { type: String },
      },
      website: { type: String },

      tshirt: { type: String, enum: ["S", "M", "L", "XL"] },

      resume: { type: String },
    },

    isCheckedIn: { type: Boolean },

    inTeam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
