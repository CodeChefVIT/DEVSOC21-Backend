const Team = require("../models/team");
const User = require("../models/user");
const mongoose = require("mongoose");
const user = require("../models/user");

exports.make = async (req, res) => {
  const { name } = req.body;
  const { userId } = req.user;
  if (!name) {
    return res.status(400).json({
      message: "Name not provided",
    });
  } else {
    User.findById(userId)
      .then((user) => {
        console.log(user);
        if (user.inTeam) {
          return res.status(403).json({
            message: "Already in a team",
          });
        } else {
          Team.findOne({ name })
            .then((team) => {
              if (team) {
                return res.status(403).json({
                  message: "Team name take, use new team name",
                });
              } else {
                var text = "";
                var charset = "abcdefghijklmnopqrstuvwxyz";
                for (var i = 0; i < 5; i++)
                  text += charset.charAt(
                    Math.floor(Math.random() * charset.length)
                  );
                const code = text.toUpperCase();

                const team = new Team({
                  _id: new mongoose.Types.ObjectId(),
                  name,
                  code,
                });

                team
                  .save()
                  .then((team) => {
                    Team.updateOne(
                      { _id: team._id },
                      { leader: userId, $addToSet: { users: userId } }
                    ).then(() => {
                      User.updateOne(
                        { _id: userId },
                        { inTeam: true, team: team._id }
                      )
                        .then(() => {
                          res.status(201).json({
                            code,
                            message: "Team created",
                          });
                        })
                        .catch((e) => {
                          res.status(500).json({
                            error: e.toString(),
                          });
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

exports.join = async (req, res) => {
  const { code } = req.body;
  const { userId } = req.user;

  const team = Team.findOne({ code });
  if (!team) {
    return res.status(404).json({
      message: "Team not found",
    });
  } else {
    User.findById(userId)
      .then((user) => {
        if (user.inTeam) {
          return res.status(403).json({
            message: "Already in a team",
          });
        } else {
          Team.findOne({ code })
            .then((team) => {
              if (team.users.length >= 5) {
                return res.status(403).json({
                  message: "Team length full",
                });
              } else {
                Team.findOneAndUpdate(
                  { code: code },
                  { $addToSet: { users: userId } },
                  { new: true }
                )
                  .then((team) => {
                    User.updateOne(
                      { _id: userId },
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

exports.leave = async (req, res) => {
  const { userId } = req.user;
  User.findById(userId)
    .then(async (user) => {
      if (!user.inTeam) {
        return res.status(403).json({
          message: "You don't have any friends, get a life",
        });
      } else {
        const current = await Team.findById(user.team)
          if(current.users.length==1){
            Team.findOneAndUpdate(
              { _id: user.team },
              { $pull: { users: userId } },
              { new: true }
            )
              .then(async (team) => {
                if (team.users.length == 0) {
                  await Team.deleteOne({ _id: user.team });
                }
    
                await User.updateOne({ _id: userId }, { team: null, inTeam: false })
                  .then(() => {
                    return res.status(200).json({
                      message: "Left team successfully",
                    });
                  })
                  .catch((e) => {
                    return res.status(500).json({
                      error: e.toString(),
                    });
                  });
              })
              .catch((e) => {
                return res.status(500).json({
                  error: e.toString(),
                });
              });
          }
        // 
          else if(current.leader==userId){
            {
            Team.findOneAndUpdate(
              { _id: user.team },
              { $pull: { users: userId } },
              { new: true }
            )
              .then(async (team) => {
                if (team.users.length != 0) {
                  await Team.updateOne({ _id: user.team },{leader:team.users[0]});
                }
    
                await User.updateOne({ _id: userId }, { team: null, inTeam: false })
                  .then(() => {
                   return res.status(200).json({
                      message: "Left team successfully",
                    });
                  })
                  .catch((e) => {
                   return res.status(500).json({
                      error: e.toString(),
                    });
                  });
              })
              .catch((e) => {
               return res.status(500).json({
                  error: e.toString(),
                });
              });
          }
        }else{
          Team.findOneAndUpdate(
            { _id: user.team },
            { $pull: { users: userId } },
            // { new: true }
          )
            .then(async () => {
              // if (team.users.length == 0) {
              //   await Team.deleteOne({ _id: user.team });
              // }
  
              await User.updateOne({ _id: userId }, { team: null, inTeam: false })
                .then(() => {
                  return res.status(200).json({
                    message: "Left team successfully",
                  });
                })
                .catch((e) => {
                  return res.status(500).json({
                    error: e.toString(),
                  });
                });
            })
            .catch((e) => {
              return res.status(500).json({
                error: e.toString(),
              });
            });
        }

      }
    })
    .catch((e) => {
      res.status(500).json({
        error: e.toString(),
      });
    });
};

exports.displayAll = async (req, res) => {
  Team.find({})
    .populate({ path: "leader", select: "name -_id" })
    .populate({ path: "users", select: "name email -_id" })
    .select("-code -idea -avatar -submission -updatedAt -__v ")
    .then((teams) => {
      res.status(200).json({
        teams,
      });
    })
    .catch((e) => {
      res.status(500).json({
        error: e.toString(),
      });
    });
};

exports.displayOne = async (req, res) => {
  const { teamId } = req.body;
  Team.findById(teamId)
    .populate({ path: "leader", select: "name -_id" })
    .populate({ path: "users", select: "name email -_id" })
    .select(" -updatedAt -__v ")
    .then((teams) => {
      res.status(200).json({
        teams,
      });
    })
    .catch((e) => {
      res.status(500).json({
        error: e.toString(),
      });
    });
};

// update

exports.update = async (req, res) => {
  const { teamId } = req.query;
  // console.log(teamId)
  update = req.body;
  Team.findOneAndUpdate({ _id: teamId }, update)
    .then((team) => {
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

exports.finalise = async (req, res) => {
  const { teamId } = req.body;
  let team = await Team.findById(teamId);
  if (team) {
    let x = !(team.finalised)
    team.finalised = x
    await Team
      .updateOne({_id: teamId },team)
      .then((result) => {
        return res.status(200).json({
          message: "Updated",
          success: true,
          team: result,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Server error",
          success: false,
          error: e.toString(),
        });
      });
  } else {
    return res.status(404).json({
      message: "Team not found",
      success: false,
      error: e.toString(),
    });
  }
};


exports.getTeamByUser = async(req,res)=>{
  const { userId } = req.user;
  const {team} = await User.findById(userId)
  if(team){
  Team.findById(team)
    .populate({ path: "leader", select: "name -_id" })
    .populate({ path: "users", select: "name email -_id" })
    .select(" -updatedAt -__v ")
    .then((teams) => {
      let isLeader = false;
      if(team.leader == userId){
        isLeader = true
      }
      res.status(200).json({
        teams,
        isLeader
      });
    })
    .catch((e) => {
      res.status(500).json({
        error: e.toString(),
      });
    });
  }
  else{
    return res.status(203).json({
      message:"Not in a team"
    })
  }
}


exports.removeUser = async(req, res)=>{
  const { userId } = req.user;
  const { remove, teamId } = req.body;
  const team = await Team.findById(teamId);
  if(!team){
    return res.status(404).json({
      success: false,
      message: "Team not found"
    })
  }else{
    //Check leader
    if(team.leader != userId){
      return res.status(404).json({
        success: false,
        message: "you are not the leader, ass"
      })
    }else{
      await Team.findOneAndUpdate(
        { _id: teamId },
        { $pull: { users: remove } },
        { new: true }
      ).then((result)=>{
        return res.status(200).json({
          success: true,
          message: "User removed"
        })
      }).catch((err)=>{
        return res.status(500).json({
          success: false,
          message: "Server error"
        })
      })
    }
  }
}
