const e = require("express");
const idgen = require("../helpers/idgen");
const roomlist = require("../helpers/roomlist");

const Bullet = require("./Bullet");

const levels = require("../helpers/levels")

class Player {
  constructor(name, id=idgen(), socket=undefined) {
    this.name = name;
    this.id = id;
    this.roomId = null;
    this.socket = socket;
    this.pos = {
      x: 0,
      y: 0,
    };
    this.speed = 1;
    this.untilNextLevel = levels[0];
    this.speedMultiplier = 1;
    this.down = false;
    this.spawnTime = Date.now();
    this.peppers = 0;
    this.shotDragons = 0;
    this.lastHit = Date.now();
    this.whoLastHit = null;
    this.healAmount = 0.005;
    this.needsFlip = false;

    this.level = 1;


    this.queuedForDeath = false;

    this.health = 100;
    this.maxHealth = 100;
    this.damage = 5;

    this.bodySize = 100;

    this.team = Math.random() > 0.5 ? "red" : "blue";

    this.hit = false;
    this.lookAngle = 0;
    this.bulletIds = new Set();
    this.lastFullSendTo = new Set();

    this.controller = {
      left: false,
      right: false,
      up: false,
      down: false,
    };
  }                                                                                                           
  joinRoom(room) {
    this.roomId = room.id;
    this.socket.emit("joinRoom", room.id);
  }
  updateController(controller) {
    //check if controller valid
    if(controller.left === undefined || controller.right === undefined || controller.up === undefined || controller.down === undefined) {
      return;
    }
    //check if any extra properties are set
    if(Object.keys(controller).length > 4) {
      return;
    }

    this.controller = controller;
  }
  updateMouse(mouseAngle, needsFlip = false) {
    this.lookAngle = mouseAngle;
    // console.log(needsFlip);
    this.needsFlip = needsFlip;
  }
  getFirstSendObject() {
    return {
      name: this.name,
      id: this.id,
      speed: this.speed,
      team: this.team,

      pos: this.pos,
      lookAngle: this.lookAngle,
      untilNextLevel: this.untilNextLevel,
      level: this.level,
    }
  }
  getSendObject() {
    return {
      id: this.id,
      pos: this.pos,
      lookAngle: this.lookAngle,
      health: this.health,
      peppers: this.peppers,
      hit: this.hit,
      level: this.level, 
      untilNextLevel: this.untilNextLevel
    };
  }
  getCorners(extraDiff = 1) {
   // get each corner of the player's body
   // make sure it's rotated correctly

    var corners = [];
    var angle = this.lookAngle+0.785398;
    var x = this.pos.x;
    var y = this.pos.y;
    var length = this.bodySize * extraDiff;

    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    corners.push({
      x: x + cos * length,
      y: y + sin * length,
    });
    corners.push({
      x: x - cos * length,
      y: y - sin * length,
    });
    corners.push({
      x: x + sin * length,
      y: y - cos * length,
    });
    corners.push({
      x: x - sin * length,
      y: y + cos * length,
    });
    // console.log(corners);
    return corners;

  }
  getCenterPoint() {
    var corners = this.getCorners();
    //find center point
    var x = 0;
    var y = 0;
    for(var i = 0; i < corners.length; i++) {
      x += corners[i].x;
      y += corners[i].y;
    }
    x /= corners.length;
    y /= corners.length;
    return {
      x,
      y,
    }
  }

  tick(tickDiff) {
    //move
    if(this.queuedForDeath) return;
    if(this.controller.left) {
      this.pos.x -= tickDiff * 0.2 * this.speed * this.speedMultiplier;
    }
    if(this.controller.right) {
      this.pos.x += tickDiff * 0.2 * this.speed * this.speedMultiplier;
    }
    if(this.controller.up) {
      this.pos.y -= tickDiff * 0.2 * this.speed * this.speedMultiplier;
    }
    if(this.controller.down) {
      this.pos.y += tickDiff * 0.2* this.speed  * this.speedMultiplier;
    }

    if(this.peppers > this.untilNextLevel) {
      this.level++;
      this.untilNextLevel = levels[this.level-1];
      // this.speedMultiplier = 1;
    }

    if(this.health < this.maxHealth) {
      if(Date.now() - this.lastHit > 5000) {
        //33 because 1000 / 30 (tick speed)
        this.health += this.maxHealth * this.healAmount * (tickDiff / 33);
      }
    }

    var corners = this.getCorners(0.5);
    // this.socket.emit("corners", [this.pos])
    //shoot
    //cloning the object is necessary because the object is changed in the tick function
    var pos =JSON.parse(JSON.stringify(this.pos));
 
    var newAngle = this.lookAngle;
   pos.x += (Math.cos(newAngle + Math.PI / 4) * this.speed * (75));
    pos.y += (Math.sin(newAngle + Math.PI / 4) * this.speed * (75));
    // pos.x -= Math.cos(Math.PI) * this.speed * (150);
    // pos.y -= Math.sin(Math.PI) * this.speed * (150);
    // this.socket.emit("test", pos);

    if(!this.down) return;
    var room = roomlist.getRoom(this.roomId);
    this.down = false;
    room.bullets.push(new Bullet(this, 0));
  }
}
module.exports = Player;