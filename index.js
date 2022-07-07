const express = require("express");
var http = require("http");
require("dotenv").config();

const app = express();
var process = require("process");

app.use(express.json());

var server = http.createServer(app);
const io = require("./helpers/io").init(server);

const Player = require("./classes/Player");
const Room = require("./classes/Room");

const roomlist = require("./helpers/roomlist");
const scan = require("./helpers/scan");

app.use("/", express.static(__dirname + "/dist"));
app.use("/", express.static(__dirname+"/public"));
const axios = require("axios");

const recaptcha = false;
// require("dotenv").config()


// app.get("/assets/videos/intro.mp4", (req, res, next) => {
//   setTimeout(() => {
//     next();
//   }, 1000);
// })

app.use("/assets", express.static(__dirname+"/assets"));

roomlist.setRoom(new Room())

app.get("/teams", (req, res) => {
  // console.log("GET /teams");
  // setTimeout(() => {
  var room = roomlist.getAllRooms()[0];
  var redPlayers = 0;
  var bluePlayers = 0;
  [...room.players.values()].forEach(player => {
    if(player.team == "red") redPlayers++;
    else if(player.team == "blue") bluePlayers++;
  });
  res.send({
    red: {playerCount: redPlayers},
    blue: {playerCount: bluePlayers}
  });
// }, 1000)

})

io.on("connection", async (socket) => {
  socket.on("go", (name, team, mouseMove, thetoken) => {
    if(!name || typeof name != "string") return;
    name = name.trim();
    if(scan(name).contains) {
      name = "*".repeat(name.length);
    }
    if(!thetoken) return socket.disconnect();

    const joinThemIn = () => {
          if(name.length == 0) return socket.disconnect();

    if(!team || typeof team != "string") team = "red";
    if(team != "red" && team != "blue") team = "red";

    name = name.substring(0,16);
    var player = new Player(name, socket.id, socket, mouseMove);
    player.team = team;
    roomlist.getAllRooms()[0].addPlayer(player);
    }

    if(thetoken == process.env.bot) return joinThemIn();
    else {
      	var send = {
		secret: process.env.captchaserver,
		response: thetoken,
	};
      		axios
			.post(
				"https://www.google.com/recaptcha/api/siteverify?" +
	  new URLSearchParams(send)
			)
			.then(async (f) => {
				f = f.data;
				if (!f.success) {
					console.log("Captcha failed " +  f["error-codes"].toString());
          if(!recaptcha) joinThemIn();
					return;
				}
				if (f.score < 0.3) {
					console.log("Captcha score too low");
					return;
				}
				joinThemIn();
			});
    }
  });
  socket.on("controller", (controller) => {
    var room = roomlist.getRoomByPlayerId(socket.id);
    if(!room) return;
    room.playerControllerUpdate(socket.id, controller);
  });
  socket.on("mouse", (mouseAngle, distance, needsFlip) => {
    var room = roomlist.getRoomByPlayerId(socket.id);
    if(!room) return;
    room.playerMouseUpdate(socket.id, mouseAngle, distance, needsFlip);
  });
  socket.on("down", (down) => {
    var room = roomlist.getRoomByPlayerId(socket.id);
    if(!room) return;
    room.playerDown(socket.id, down);
  })
  socket.on("ping", (fn) => {
    fn(); // Simply execute the callback on the client
  })
  socket.on("disconnect", async () => {
    var room = roomlist.getRoomByPlayerId(socket.id);
    if(room) {
      room.removePlayer(socket.id);
    }
  });
});

//tick rooms
var tps = 0;
var actps = 0;
var secondStart = Date.now();
setInterval(() => {
  roomlist.tickAll();
  tps++;
  if(Date.now() - secondStart > 1000) {
    // console.log("tps: " + tps);
    actps = tps;
    console.log("TPS", actps)
    tps = 0;
    secondStart = Date.now();
  }
}, 1000/30);

server.listen(process.env.PORT || 3000, () => {
  console.log("server started");
});
