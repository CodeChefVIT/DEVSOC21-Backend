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

    college: { type: String, default: "" },

    bio: { type: String, default: ""  },

    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

    address: {
      line1: { type: String, default: ""  },
      line2: { type: String, default: ""  },
      pincode: { type: Number },
      city: { type: String, default: ""  },
      state: { type: String, default: ""  },
      country: { type: String, default: ""  },
    },
    personal: {
      github: { type: String, default: ""  },
      discord: {
        nickname: { type: String, default: ""  },
        hash: { type: String, default: ""  },
      },
      website: { type: String, default: ""  },

      tshirt: { type: String, enum: ["S", "M", "L", "XL"] },

      resume: { type: String, default: ""  },
    },

    isCheckedIn: { type: Boolean },

    inTeam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
