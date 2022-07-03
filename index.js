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

app.use("/", express.static(__dirname + "/dist"));
app.use("/", express.static(__dirname+"/public"));


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
  socket.on("go", (name, team) => {
    if(!name || typeof name != "string") return;
    name = name.trim();
    if(name.length == 0) return socket.disconnect();

    if(!team || typeof team != "string") team = "red";
    if(team != "red" && team != "blue") team = "red";

    name = name.substring(0,16);
    var player = new Player(name, socket.id, socket);
    player.team = team;
    roomlist.getAllRooms()[0].addPlayer(player);
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
