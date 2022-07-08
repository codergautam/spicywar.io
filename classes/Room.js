const idgen = require("../helpers/idgen");
const io = require("../helpers/io");
const intersect = require("intersects");
const Island = require("./Island");
const Bridge = require("./Bridge");
const Pepper = require("./Pepper");

class Room {
  constructor() {
    this.id = idgen();
    this.players = new Map();
    this.maxPlayers = 50;
    this.lastTick = Date.now();
    this.bullets = [];
    this.islands = [];
    this.bridges = [];
    this.peppers = new Map();

    this.islands.push(new Island(
      "circle",
      1000,
      { x: 0, y: 0 },
      false
    ));

    this.islands.push(new Island(
      "circle",
      500,
      { x: 1400, y: 1400 },
    ));

    this.islands.push(new Island(
      "circle",
      500,
      { x: -1300, y: 1400 },
    ));
    
    this.islands.push(new Island(
      "circle",
      500,
      { x: 1700, y: -300 },
    ));
    this.islands.push(new Island(
      "circle",
      500,
      { x: -1600, y: -300 },
    ));
    this.islands.push(new Island(
      "circle",
      500,
      { x: 0, y: -1600 },
    ));
    this.bridges.push(new Bridge(this.islands[0], this.islands[1], 150));
     this.bridges.push(new Bridge(this.islands[0], this.islands[2], 150));
      this.bridges.push(new Bridge(this.islands[0], this.islands[3], 150));
      this.bridges.push(new Bridge(this.islands[0], this.islands[4], 150));
      this.bridges.push(new Bridge(this.islands[0], this.islands[5], 150));

      this.bridges.push(new Bridge(this.islands[1], this.islands[2], 200));
      this.bridges.push(new Bridge(this.islands[2], this.islands[4], 150));
      this.bridges.push(new Bridge(this.islands[4], this.islands[5], 150));
      this.bridges.push(new Bridge(this.islands[5], this.islands[3], 150));
      this.bridges.push(new Bridge(this.islands[3], this.islands[1], 150));

    

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
  playerMouseUpdate(id, mouseAngle, distance, needsFlip) {
    var player = this.players.get(id);
    if(player) {
      if(typeof mouseAngle == "number" && !isNaN(mouseAngle)) {
      player.updateMouse(mouseAngle, distance, needsFlip);
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
  getDomination() {
    var totalDomination = {
      red: 0,
      blue: 0,
      none: 0
    }
    var cnt = 0;
    this.islands.filter((i) => i.canBeCaptured).forEach((island) => {
      cnt++;
      var i = island.getDomination();
      totalDomination.red += i.red;
      totalDomination.blue += i.blue;
      totalDomination.none += i.none;
    });
    totalDomination.red /= cnt;
    totalDomination.blue /= cnt;
    totalDomination.none /= cnt;

    //round
    totalDomination.red = Math.round(totalDomination.red);
    totalDomination.blue = Math.round(totalDomination.blue);
    totalDomination.none = Math.round(totalDomination.none);

    return totalDomination;
  }
  getSpiceMeter(id) {
  }
  checkCollisions(player, reason) {
    if(player.canFly) return;
    if(player.queuedForDeath &&Date.now() >= player.queuedForDeath) {
      if(Date.now() - player.lastHit <= 2000 && this.players.has(player.whoLastHit)) {
        var lastHitPlayer = this.players.get(player.whoLastHit);
        reason.tick = false;
        reason.who = {id: lastHitPlayer.id, name: lastHitPlayer.name};
      }

      player.socket.emit("youDied", {reason: "drown", who: reason.tick ? null : reason.who.name, survivedTime: Date.now() - player.spawnTime, peppers: player.peppers, shotDragons: player.shotDragons});
      player.socket.to(this.id).emit("playerLeft", player.id);
      if(!reason.tick && this.players.has(reason.who.id)) {
        this.players.get(reason.who.id).shotDragons++;
        this.players.get(reason.who.id).peppers += Math.min(Math.max(10,Math.round(player.peppers * 0.5)), 1000);
        this.players.get(reason.who.id).socket.emit("shotDragon", {reason: "drown", who: player.name, id: player.id});
      }
      this.players.delete(player.id);
    }

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

      if(!player.queuedForDeath)  player.queuedForDeath = Date.now() + 200;
      }
    }
  }
  tick() {
    var tickDiff = Date.now() - this.lastTick;
    this.lastTick = Date.now();
    var ioinstance = io.getio();
    this.players.forEach((player) => {

      player.tick(tickDiff);

      [...this.peppers.values()].forEach((pepper) => {
        if(pepper.touchingPlayer(player)) {
          player.peppers ++;
          this.peppers.delete(pepper.id);
          ioinstance.emit("pepperCollected", pepper.id, player.id);
        };
      });

      ioinstance.to(this.id).emit("playerUpdate", player.getSendObject());
      if(player.hit) player.hit = false;

      // var atleastinoneisland = this.islands.some((island) => island.capturedBy == player.team && island.isIn(player.pos));
      // if(!atleastinoneisland) {
      //   player.speedMultiplier = 1;
      // } else {
      //   player.speedMultiplier = 1.5;
      // }
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
          if(!(bullet.team == player.team || Date.now() - player.spawnTime < 3000)) {

            //emit to hitter
          

          player.pos.x += bullet.speed * Math.cos(bullet.angle) * tickDiff * (player.bulletLevel == 1 ? 5 : player.bulletLevel == 2 ? 7 : 10);
          player.pos.y += bullet.speed * Math.sin(bullet.angle) * tickDiff * (player.bulletLevel == 1 ? 5 : player.bulletLevel == 2 ? 7 : 10);
          player.health -= bullet.damage;
          player.lastHit = Date.now();
          player.whoLastHit = bullet.owner;
          if(player.health <= 0) {
            player.socket.emit("youDied", {reason: "burnt", who: bullet.ownerName, survivedTime: Date.now() - player.spawnTime, peppers: player.peppers, shotDragons: player.shotDragons});
            player.socket.to(this.id).emit("playerLeft", player.id);
            if(this.players.has(bullet.owner)) {
              this.players.get(bullet.owner).shotDragons++;
              this.players.get(bullet.owner).peppers += Math.round(player.peppers * 0.5);
              this.players.get(bullet.owner).socket.emit("shotDragon", {reason: "burnt", who: player.name, id: player.id});
            }
            this.players.delete(player.id);
          } else {

            player.socket.emit("gotHit");
          if(this.players.has(bullet.owner)) {
            var owner = this.players.get(bullet.owner);
            owner.socket.emit("hitSomeone");
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

    //emit to all players
    ioinstance.to(this.id).emit("peppers", [...this.peppers.values()].map((pepper) => pepper.getSendObject()));
    
  }

}

module.exports = Room;