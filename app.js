const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const User = require("./api/models/user");
const Team = require("./api/models/team");
require("dotenv").config();
var morgan = require("morgan");
require("./cronJobs/index");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser')
const fs = require('fs')
const csvWriter = createCsvWriter({
  path: 'notIdea.csv',
  header: [
    { id: 'name', title: 'name' },
    { id: 'email', title: 'email' },
    { id: 'mobile', title: 'mobile' },
  ]
});
// const useragent = require("express-useragent");

const database = require("./config/database");

const logResponseBody = require("./utils/logResponse");
const { getAppStatus } = require("./api/controllers/appController");

const Like = require("./api/models/like");

var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(morgan("combined"));
app.set("trust proxy", 1);
var limiter = new rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message:
    "Too many requests created from this IP, please try again after an hour",
});
app.use(limiter);

// const passport_config = require("./api/config/studentGoogleAuth");

mongoose.Promise = global.Promise;

//Use helmet to prevent common security vulnerabilities
app.use(helmet());

//Set static folder
app.use("/uploads", express.static("./public"));

//Use body-parser to parse json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(logResponseBody);

// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, auth-token"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(cors());

// app.use(useragent.express());

// if (process.env.NODE_ENV == "production") {
//   app.use((req, res, next) => {
//     if (req.useragent["isBot"] == false) {
//       next();
//     } else {
//       res.status(401).json({
//         message:
//           "Please try using a different browser: Interception is blocked",
//       });
//     }
//   });
// }

// ADD ROUTERS
app.use("/auth", require("./config/googleAuth"));
app.use("/team", require("./api/routers/team"));
app.use("/user", require("./api/routers/user"));

app.use("/app", require("./api/routers/appRouters"));

app.use("/admin", require("./api/routers/admin"));

// ROUTERS END

app.get("/appdata", async (req, res) => {
  res.status(200).json({ data: getAppStatus() });
});

app.get("/registrations", async (req, res) => {
  const users = await User.find({});
  const teams = await Team.find({});
  return res.status(200).json({
    numberOfUsers: users.length,
    numberOfTeams: teams.length,
    users,
    teams,
  });
});

app.get("/checkServer", (req, res) => {
  return res.status(200).json({
    message: "Server is up and running",
  });
});

if (process.env.NODE_ENV == "development") {
  app.use("/dev", require("./api/routes/dev.routes"));
}

app.get("/getNoSubmission", async (req, res) => {
  const users = await User.find({inTeam:true})
  const array = []
  const teams = []
  for(let user of users){
      const team = await Team.findById(user.team)
      if(team){
      if(team.submission.status == "Not Submitted"){
        array.push(user)
        teams.push(team)
      }
    }
  }
  console.log(array.length)
  csvWriter
  .writeRecords(array)
  .then(()=> {
    return res.send(array);
  })
});
const csvwrite = createCsvWriter({
  path: 'bulk2.csv',
  header: [
    { id: 'Email', title: 'Email' },
  ]
});
app.get('/bulkCsv', async(req, res)=>{
  const array = []
  const results =[]
  fs.createReadStream('all.csv')
  .pipe(csv())
  .on('data', (data) => { results.push(data) })
  .on('end', async () => {
    for(i in results){
      console.log(i)
    const user = await User.findOne({email: results[i].Email})
      if(!user){
        array.push(results[i])
      }
    }
    csvwrite
    .writeRecords(array)
    .then(()=> {
      return res.send(array);
    })
    // sendMail("nousernameidea0709@gmail.com")
  },
)
})

//This function will give a 404 response if an undefined API endpoint is fired
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

//

//sockets

//to keep connection alive
function sendHeartbeat() {
  setTimeout(sendHeartbeat, 8000);
  io.sockets.emit("ping", { beat: 1 });
}

io.on("connection", (sc) => {
  console.log(`Socket ${sc.id} connected.`);

  // io.sockets.emit("connect", `Socket ${sc.id} connected.`);
  sc.on("pong", function (data) {
    console.log("Pong received from client");
  });
  sc.on("disconnect", () => {
    console.log(`Socket ${sc.id} disconnected.`);
  });

  sc.on("like", async (userId, teamId) => {
    await Like.updateOne(
      { teamId },
      { $addToSet: { likes: userId } },
      { new: true }
    )
      .then((result) => {
        // console.log(result)
        io.sockets.emit("count", { teamId: result.likes.length });
      })
      .catch((e) => {
        console.log(e.toString());
      });
  });
  setTimeout(sendHeartbeat, 8000);
});

const PORT = process.env.PORT || 3000;

//Start the server
http.listen(PORT, function () {
  console.log(`listening on PORT: ${PORT}`);
});

// module.exports = app;

