const mongoose = require("mongoose");

const chessSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: {type: String},

    number: {type: String},

    email: { type: String },

    discordID: { type: String},

    liChessId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chess", chessSchema);
