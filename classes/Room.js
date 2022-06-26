const idgen = require("../helpers/idgen");
const io = require("../helpers/io");
const intersect = require("intersects");
const Island = require("./Island");
const Bridge = require("./Bridge");

class Room {
  constructor() {
    this.id = idgen();
    this.players = new Map();
    this.maxPlayers = 50;
    this.lastTick = Date.now();
    this.bullets = [];
    this.islands = [];
    this.bridges = [];

    this.islands.push(new Island(
      "circle",
      1500,
      { x: 0, y: 0 },
      false
    ));

    this.islands.push(new Island(
      "circle",
      500,
      { x: 1200, y: 1200 },
    ));

    this.islands.push(new Island(
      "circle",
      500,
      { x: -1100, y: 1200 },
    ));
    
    this.islands.push(new Island(
      "circle",
      500,
      { x: 1500, y: -100 },
    ));
    this.islands.push(new Island(
      "circle",
      500,
      { x: -1400, y: -100 },
    ));
    this.islands.push(new Island(
      "circle",
      500,
      { x: 0, y: -1400 },
    ));
    this.bridges.push(new Bridge(this.islands[0], this.islands[1], 100));
     this.bridges.push(new Bridge(this.islands[0], this.islands[2], 100));
      this.bridges.push(new Bridge(this.islands[0], this.islands[3], 100));
      this.bridges.push(new Bridge(this.islands[0], this.islands[4], 100));
      this.bridges.push(new Bridge(this.islands[0], this.islands[5], 100));

      this.bridges.push(new Bridge(this.islands[1], this.islands[2], 100));
      this.bridges.push(new Bridge(this.islands[2], this.islands[4], 100));
      this.bridges.push(new Bridge(this.islands[4], this.islands[5], 100));
      this.bridges.push(new Bridge(this.islands[5], this.islands[3], 100));
      this.bridges.push(new Bridge(this.islands[3], this.islands[1], 100));

    

  }
  addPlayer(player) {
    var ioinstance = io.getio();
    player.joinRoom(this);
    this.players.set(player.id, player);
    player.socket.join(this.id);
    
    //TODO: only send players in range
    ioinstance.to(this.id).emit("playerJoined", player.getFirstSendObject());
    player.socket.emit("players", [...this.players.values()].map((player) => player.getFirstSendObject()));
    player.socket.emit("bullets", this.bullets.map((bullet) => bullet.getSendObject()));
    player.socket.emit("islands", this.islands.map((island) => island.getSendObject()));
    player.socket.emit("bridges", this.bridges.map((bridge) => bridge.getSendObject()));
  }
  removePlayer(id) {
    var ioinstance = io.getio();
    var player = this.players.get(id);
    if(player) {
      player.socket.leave(this.id);
      this.players.delete(id);
      ioinstance.to(this.id).emit("playerLeft", id);
    }
  }
  playerControllerUpdate(id, controller) {
    var player = this.players.get(id);
    if(player) {
      player.updateController(controller);
    }
  }
  playerMouseUpdate(id, mouseAngle) {
    var player = this.players.get(id);
    if(player) {
      if(typeof mouseAngle == "number" && !isNaN(mouseAngle)) {
      player.updateMouse(mouseAngle);
      }
    }
  }
  playerDown(id, down) {
    if(!typeof down == "boolean") return;
    var player = this.players.get(id);
    if(player) {
      player.down = down;
    }
  }
  getSpiceMeter(id) {
  }
  tick() {
    var tickDiff = Date.now() - this.lastTick;
    this.lastTick = Date.now();
    var ioinstance = io.getio();
    this.players.forEach((player) => {

      player.tick(tickDiff);
      ioinstance.to(this.id).emit("playerUpdate", player.getSendObject(), {hit: player.hit});
      if(player.hit) player.hit = false;

      //make sure player is on island
    var inisland = this.islands.some((island) => {
        if(island.isIn(player.pos)) {
          return true;
        } else return false;
      });
      if(!inisland) {
        var isinbridge = this.bridges.some((bridge) => {
          if(bridge.isIn(player)) {
            return true;
          } else return false;
        });
        if(!isinbridge) {
        player.socket.emit("youDied", {reason: "drown"});
        ioinstance.to(this.id).emit("playerLeft", player.id);
        this.players.delete(player.id);
        }
      }
    });
    this.bullets.forEach((bullet) => {
      bullet.tick(tickDiff);
    });
    this.bullets = this.bullets.filter((bullet) => {
      if(Date.now() - bullet.createdAt > 1000) {
        ioinstance.to(this.id).emit("removeBullet", bullet.id);
        return false;
      } else return true;
    });
    this.bullets = this.bullets.filter((bullet) => {
      for (var player of Array.from(this.players.values())) {
        if(bullet.collidingPlayer(player)) {
          if(bullet.team != player.team) {
          player.pos.x += bullet.speed * Math.cos(bullet.angle) * tickDiff * 5;
          player.pos.y += bullet.speed * Math.sin(bullet.angle) * tickDiff * 5;
          player.hit = true;
          }
          ioinstance.to(this.id).emit("removeBullet", bullet.id);
          return false;
        }
      };
      for (var bullet1 of Array.from(this.bullets)) {
        if(bullet1.id  == bullet.id || bullet.owner == bullet1.owner) continue;
        if(bullet.collidingBullet(bullet1)) {
          ioinstance.to(this.id).emit("removeBullet", bullet.id);
          return false;
        }
      }
      return true;
    });
    this.islands.forEach((island) => {
      island.tick(tickDiff, this);
    });
    
  }

}

module.exports = Room;