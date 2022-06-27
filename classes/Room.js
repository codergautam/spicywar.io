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
  checkCollisions(player, reason) {
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
        if(Date.now() - player.lastHit <= 1000 && this.players.has(player.whoLastHit)) {
          var lastHitPlayer = this.players.get(player.whoLastHit);
          reason.tick = false;
          reason.who = {id: lastHitPlayer.id, name: lastHitPlayer.name};
        }

      if(!player.queuedForDeath)  player.queuedForDeath = Date.now() + 200;

      if(Date.now() >= player.queuedForDeath) {


      player.socket.emit("youDied", {reason: "drown", who: reason.tick ? null : reason.who.name, survivedTime: Date.now() - player.spawnTime, peppers: player.peppers, shotDragons: player.shotDragons});
      player.socket.to(this.id).emit("playerLeft", player.id);
      if(!reason.tick && this.players.has(reason.who.id)) {
        this.players.get(reason.who.id).shotDragons++;
        this.players.get(reason.who.id).socket.emit("shotDragon", {how: "drown", who: player.name, id: player.id});
      }
      this.players.delete(player.id);
    }
      }
    }
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
      this.checkCollisions(player, {tick: true, who: ""});

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
          player.health -= bullet.damage;
          player.lastHit = Date.now();
          player.whoLastHit = bullet.owner;
          if(player.health <= 0) {
            player.socket.emit("youDied", {reason: "burnt", who: bullet.ownerName, survivedTime: Date.now() - player.spawnTime, peppers: player.peppers, shotDragons: player.shotDragons});
            player.socket.to(this.id).emit("playerLeft", player.id);
            if(this.players.has(bullet.owner)) {
              this.players.get(bullet.owner).shotDragons++;
              this.players.get(bullet.owner).socket.emit("shotDragon", {how: "burnt", who: player.name, id: player.id});
            }
          }

          player.hit = true;
          this.checkCollisions(player, {tick: false, who: {name: bullet.ownerName, id: bullet.owner}});
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