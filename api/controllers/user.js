const User = require("../models/user");
const Team = require("../models/team");
const mongoose = require("mongoose");
const { sendEmail } = require("../../config/emailScript");

exports.update = async (req, res) => {
  const { userId } = req.user;
  // console.log(teamId)
  update = req.body;
  User.findOneAndUpdate({ _id: userId }, update)
    .then((user) => {
      res.status(201).json({
        message: "Updated successfully",
      });
    })
    .catch((e) => {
      res.status(500).json({
        error: e.toString(),
      });
    });
};

exports.getProfile = async (req, res) => {
  const { userId } = req.user;
  let user = await User.aggregate([
    {
      $match: { _id: { $eq: mongoose.Types.ObjectId(userId) } },
    },
    {
      $lookup: {
        from: "teams",
        localField: "team",
        foreignField: "_id",
        as: "team",
      },
    },
    {
      $project: {
        name: 1,
        googleId: 1,
        email: 1,
        mobile: 1,
        avatar: 1,
        college: 1,
        bio: 1,
        "address.line1": 1,
        "address.line2": 1,
        "address.pincode": 1,
        "address.city": 1,
        "address.state": 1,
        "address.country": 1,
        "personal.github": 1,
        "personal.linkedin": 1,
        "personal.website": 1,
        "personal.tshirt": 1,
        "personal.resume": 1,
        "personal.discord": 1,
        isCheckedIn: 1,
        inTeam: 1,
        "team._id": 1,
        "team.name": 1,
        "team.code": 1,
      },
    },
  ]);
  if (user) {
    user = Object(user[0]);
    if (user.team && user.team.length >= 1) {
      user.team = user.team[0];
    }
    res.status(200).json({
      success: true,
      user,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Does not exist",
    });
  }
};

exports.sendInvite = async (req, res) => {
  const { inviteEmail, teamId } = req.body;
  const { userId } = req.user;
  const team = await Team.findById(teamId);
  if (!team || team.leader != userId) {
    console.log(team.leader, userid)
    res.status(404).json({
      success: false,
      message: "Does not exist",
    });
  } else if (team && team.invitedTeammates.includes(inviteEmail)){
    res.status(410).json({
      success: false,
      message: "User already invited",
    });
  }else {
    const user = await User.findOne({ email: inviteEmail });
    if (user) {
      if (user.inTeam) {
        return res.status(403).json({
          success: false,
          message: "already in a team",
        });
      }
      const text = `${process.env.EMAIL_REDIRECT}/jointeam?teamCode=${team.code}&email=${inviteEmail}&isRegistered=${true}`;
      await Team.updateOne(
        {
          _id: teamId,
        },
        {
          $addToSet: { invitedTeammates: inviteEmail },
        }
      )
        .then(async (result) => {
          console.log(text);
          await sendEmail(
            process.env.SES_EMAIL,
            inviteEmail,
            "Invite to team",
            text
          );
          return res.status(200).json({
            success: true,
          });
        })
        .catch((err) => {
          res.status(500).json({
            success: false,
            message: "server error",
          });
        });
    } else {
      const text = `${process.env.EMAIL_REDIRECT}/jointeam?teamCode=${team.code}&email=${inviteEmail}&isRegistered=${false}`;
      console.log(text);
      await Team.updateOne(
        {
          _id: teamId,
        },
        {
          $addToSet: { invitedTeammates: inviteEmail },
        }
      )
        .then(async (result) => {
          await sendEmail(
            process.env.SES_EMAIL,
            inviteEmail,
            "Invite to team",
            text
          );
          return res.status(200).json({
            success: true,
          });
        })
        .catch((err) => {
          res.status(500).json({
            success: false,
            message: "server error",
          });
        });
    }
  }
};

exports.join = async (req, res) => {
  const { code, email } = req.body;

  const team = await Team.findOne({ code });
  if (team && !team.invitedTeammates.includes(email)) {
    return res.status(405).json({
      message: "Uninvited",
    });
  }
  if (!team) {
    return res.status(404).json({
      message: "Team not found",
    });
  } else {
    User.findOne({ email })
      .then((user) => {
        if (user.inTeam) {
          return res.status(403).json({
            message: "Already in a team",
          });
        } else {
          Team.findOne({ code })
            .then((team) => {
              if (team.users.length >= 5) {
                return res.status(407).json({
                  message: "Team length full",
                });
              } else {
                Team.findOneAndUpdate(
                  { code: code },
                  {
                    $addToSet: { users: user._id },
                    $pull: { invitedTeammates: email },
                  },
                  { new: true }
                )
                  .then((team) => {
                    User.updateOne(
                      { email: email },
                      { inTeam: true, team: team._id }
                    )
                      .then(() => {
                        res.status(201).json({
                          message: "Successfully joined team",
                        });
                      })
                      .catch((e) => {
                        res.status(500).json({
                          error: e.toString(),
                        });
                      });
                  })
                  .catch((e) => {
                    res.status(500).json({
                      error: e.toString(),
                    });
                  });
              }
            })
            .catch((e) => {
              res.status(500).json({
                error: e.toString(),
              });
            });
        }
      })
      .catch((e) => {
        res.status(500).json({
          error: e.toString(),
        });
      });
  }
};

exports.cancelInvite = async (req, res) => {
  const { inviteEmail, teamId } = req.body;
  const { userId } = req.user;
  const team = await Team.findById(teamId);
  if (!team || team.leader != userId) {
    res.status(404).json({
      success: false,
      message: "Does not exist",
    });
  }
  await Team.updateOne(
    {
      _id: teamId,
    },
    {
      $pull: { invitedTeammates: inviteEmail },
    }
  )
    .then(async (result) => {
      return res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "server error",
      });
    });
};
