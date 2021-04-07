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
// const useragent = require("express-useragent");

const database = require("./config/database");

const logResponseBody = require("./utils/logResponse");
const Like = require("./api/models/like");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
// ROUTERS END

app.get('/appdata', async(req, res)=>{
  res.status(200).json({
      "today": 2,
      "day1": [
        {
          "title": "Backend",
          "start": "2021-04-05 01:00:00",
          "end": "2021-04-05 04:00:00",
          "startVal": 1,
          "duration": 3,
        },
        {
          "title": "Sad Boy Hours",
          "start": "2021-04-05 05:00:00",
          "end": "2021-04-05 06:00:00",
          "startVal": 5,
          "duration": 1,
        },
        {
          "title": "Review 1",
          "start": "2021-04-05 10:00:00",
          "end": "2021-04-05 12:00:00",
          "startVal": 10,
          "duration": 2,
        },
        {
          "title": "CodeChef Hours",
          "start": "2021-04-05 14:00:00",
          "end": "2021-04-05 15:30:00",
          "startVal": 14,
          "duration": 1.5,
        },
        {
          "title": "TL T",
          "start": "2021-04-05 22:00:00",
          "end": "2021-04-05 23:00:00",
          "startVal": 22,
          "duration": 1,
        },
      ],
      "day2": [
        {
          "title": "Talk on Blockchain by Pranjal",
          "start": "2021-04-06 01:00:00",
          "end": "2021-04-06 02:00:00",
          "startVal": 1,
          "duration": 1,
        },
        {
          "title": "Naseeb life",
          "start": "2021-04-06 05:00:00",
          "end": "2021-04-06 06:00:00",
          "startVal": 5,
          "duration": 1,
        },
        {
          "title": "Technical Meet",
          "start": "2021-04-06 10:00:00",
          "end": "2021-04-06 12:00:00",
          "startVal": 10,
          "duration": 2,
        },
        {
          "title": "TL T",
          "start": "2021-04-06 14:00:00",
          "end": "2021-04-06 15:30:00",
          "startVal": 14,
          "duration": 1.5,
        },
      ],
      "day3": [
        {
          "title": "Talk on NODE",
          "start": "2021-04-07 01:00:00",
          "end": "2021-04-07 03:00:00",
          "startVal": 1,
          "duration": 2,
        },
        {
          "title": "NO THIS IS EPIC",
          "start": "2021-04-07 09:00:00",
          "end": "2021-04-07 10:00:00",
          "startVal": 9,
          "duration": 1,
        },
        {
          "title": "Review 2",
          "start": "2021-04-07 11:00:00",
          "end": "2021-04-07 12:00:00",
          "startVal": 11,
          "duration": 1,
        },
        {
          "title": "Something",
          "start": "2021-04-07 14:00:00",
          "end": "2021-04-07 15:30:00",
          "startVal": 14,
          "duration": 1.5,
        },
      ],
  })
})

app.get('/registrations', async(req,res)=>{
  const users = await User.find({});
  const teams = await Team.find({});
  return res.status(200).json({
    numberOfUsers: users.length,
    numberOfTeams: teams.length,
    users,
    teams
  })
})

app.get("/checkServer", (req, res) => {
  return res.status(200).json({
    message: "Server is up and running",
  });
});

if (process.env.NODE_ENV == "development") {
  app.use("/dev", require("./api/routes/dev.routes"));
}

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

//sockets

//to keep connection alive
function sendHeartbeat(){
	setTimeout(sendHeartbeat, 8000);
	io.sockets.emit('ping', { beat : 1 });
}

io.on("connection", (sc) => {
	console.log(`Socket ${sc.id} connected.`);

	io.sockets.emit('connect',`Socket ${sc.id} connected.`)
	sc.on('pong', function(data){
		console.log("Pong received from client");
});
  sc.on('disconnect', () => {
    console.log(`Socket ${sc.id} disconnected.`);
  });

	sc.on("like", async (userId,teamId) => {

	await Like.updateOne({teamId},{$addToSet:{likes:userId}},{new:true}).then((result)=>{
		// console.log(result)
		io.sockets.emit('count',{teamId:result.likes.length})
	}).catch((e)=>{
		console.log(e.toString())
	})
	});
setTimeout(sendHeartbeat, 8000);

});

const PORT = process.env.PORT || 3000;

//Start the server
http.listen(PORT, function(){
	console.log(`listening on PORT: ${PORT}`);
});


// module.exports = app;
