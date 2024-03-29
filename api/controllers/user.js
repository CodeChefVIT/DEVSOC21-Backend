const User = require("../models/user");
const aws = require("aws-sdk");
const Team = require("../models/team");
const mongoose = require("mongoose");
const { sendEmail } = require("../../config/emailScript");
const { sendInvite } = require("../../config/sendInviteEmail");
const pdf = require('html-pdf');
const axios = require("axios");
const certicifateTemplate = require("../../config/certificateHtml")
var admin = require("firebase-admin");
// var serviceAccount = require("../../devsoc21-firebase-adminsdk-jzxvt-1bca73a0fc.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

exports.update = async (req, res) => {
  const { userId } = req.user;
  if (
    req.body.avatar ||
    req.body.email ||
    req.body.numOtpLogins ||
    req.body.otpTimestamp ||
    req.body.formSubmitTimeExpiry ||
    req.body.otpExpiryTimestamp
  ) {
    return res.status(500).json({
      message: "sorry no ctf here",
    });
  }
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
        collegeYear: 1,
        regNumber: 1,
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
        "team.submission": 1,
      },
    },
  ]);

  if (user) {
    user = Object(user[0]);
    if (user.team && user.team.length >= 1) {
      user.team = user.team[0];
    }
    console.log(user);
    let is_profile_completed = true;
    if (
      !user.name ||
      !user.mobile ||
      user.college == "" ||
      !user.collegeYear ||
      user.bio == "" ||
      user.address.line1 == "" ||
      !user.address.pincode ||
      user.address.city == "" ||
      user.address.state == "" ||
      user.address.country == "" ||
      user.personal.github == "" ||
      user.personal.linkedin == "" ||
      !user.personal.tshirt ||
      user.personal.resume == "" ||
      user.personal.discord.nickname == "" ||
      user.personal.discord.hash == ""
    ) {
      is_profile_completed = false;
    }
    let show_certificate = false
    if(user.team && user.team.submission && user.team.submission.status != "Not Shortlisted For DEVSOC'21"){
      show_certificate = true
    }
    user.show_certificate = show_certificate
    user.is_profile_completed = is_profile_completed;
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
  if (team && team.users.length == 5) {
    return res.status(409).json({
      success: false,
      message: "Team is full",
    });
  }
  if (!team || team.leader != userId) {
    console.log(team.leader, userid);
    res.status(404).json({
      success: false,
      message: "Does not exist",
    });
  } else if (team && team.invitedTeammates.includes(inviteEmail)) {
    res.status(410).json({
      success: false,
      message: "User already invited",
    });
  } else {
    const user = await User.findOne({ email: inviteEmail });
    if (user) {
      if (user.inTeam) {
        return res.status(403).json({
          success: false,
          message: "already in a team",
        });
      }
      const text = `${process.env.EMAIL_REDIRECT}/jointeam?teamCode=${
        team.code
      }&email=${inviteEmail}&isRegistered=${true}`;
      const html = sendInvite(req.user.name, text, team.code);
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
            `Team join invite by ${req.user.name} | DEVSOC 22`,
            html
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
      const text = `${process.env.EMAIL_REDIRECT}/jointeam?teamCode=${
        team.code
      }&email=${inviteEmail}&isRegistered=${false}`;
      const html = sendInvite(req.user.name, text, team.code);
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
            `Team join invite by ${req.user.name} | DEVSOC 22`,
            html
          );
          return res.status(200).json({
            success: true,
          });
        })
        .catch((err) => {
          res.status(500).json({
            success: false,
            message: "server error",
            err: err.toString(),
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

// exports.sendFCM = async (req, res) => {
//   var registrationToken = "df4OvFlBcUqKlwa2YkJsGC:APA91bHF45PHbfkroIVkbs2rC3LHLGCqdRfJMC8C9GeVtEgW9tNfmhwGsN15Amxj4u0-DuGYRaxmzLRblHPZaQ5o_cErbPFicPDEKrFmJIby8E9GGOBXnBeSpwZJMuQealsuJ4OlzbyU";

//   var message = {
//     token: registrationToken,

//     notification: {
//       title: "Match update",
//       body: "Arsenal goal in added time, score is now 3-0",
//     },
//     data: {
//       "click_action": "FLUTTER_NOTIFICATION_CLICK",
//       "sound": "default",
//       "status": "done",
//       "screen": "screenA",
//     },
//     apns: {
//       headers: {
//         "apns-priority": "5",
//       },
//       payload: {
//         aps: {
//           category: "NEW_MESSAGE_CATEGORY",
//         },
//       },
//     },
//   };

//   // Send a message to the device corresponding to the provided
//   // registration token.
//   admin
//     .messaging()
//     .send(message)
//     .then((response) => {
//       // Response is a message ID string.
//       console.log("Successfully sent message:", response);
//       res.send(response)
//     })
//     .catch((error) => {
//       console.log("Error sending message:", error);
//       res.send(error)
//     });
// };

exports.generateCertificate = async (req, res, next) => {
  let html;
  const { userId } = req.user;
  const user = await User.findById(userId);
  const team = await Team.findById(user.team)
  // if (user.certificate || user.certificate == "") {
  //   return res.status(200).json({
  //     message: "Certificate Already Generated",
  //     link: user.certificate,
  //   });
  // }
  html = certicifateTemplate.generateParticipantTemplate(user.name, team.name);
  const filename = `certificate/${user.name}_DEVSOC'21_${user._id}`;
  await pdf
    .create(html, { height: "900px", width: "1440px", timeout: "100000" })
    .toStream(async function (err, stream) {
      if (err) return console.log(err);
      await uploadToS3(res, stream, filename, userId);
    });
  console.log(user);
};

const uploadToS3 = async (res, body, filename, userId) => {
  aws.config.update({
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
  });

  var s3 = new aws.S3();

  var params = {
    Body: body,
    ACL: "public-read",
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename + ".pdf",
  };
  await s3.upload(params, async function (err, data) {
    console.log(err, data);
    await User.updateOne(
      { _id: userId },
      {
        certificate: data.Location,
      }
    )
      .then(async () => {
        return res.status(200).json({
          message: "Generated",
          certificate: data.Location,
        });
      })
      .catch((err) => {
        res.status(500).json({
          success: false,
          message: "server error",
        });
      });
  });
};
