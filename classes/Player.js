const e = require("express");
const idgen = require("../helpers/idgen");
const roomlist = require("../helpers/roomlist");

const Bullet = require("./Bullet");

const levels = require("../helpers/levels")

var mousemove = true;

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
    this.lastShoot = 0;

    this.force = 0.5;

    this.bulletLevel = 1;
    this.speedLevel = 1;
    this.sizeLevel = 1;
    this.healthLevel = 1;
    this.canFly = false;

    this.level = 1;


    this.queuedForDeath = false;

    this.health = 100;
    this.maxHealth = 100;
    this.damage = 5;

    this.bodySize = 100 + (this.sizeLevel == 1 ? 0 : this.sizeLevel == 2 ? 20 : 40);


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
  updateMouse(mouseAngle, distance = 0.5, needsFlip = false) {
    this.lookAngle = mouseAngle;
    // console.log(needsFlip);
    this.needsFlip = needsFlip;
    this.force = Math.max(0, Math.min(distance, 1));
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
      bodySize: this.bodySize,
      maxHealth: this.maxHealth,
      health: this.health,
      
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
      untilNextLevel: this.untilNextLevel,
      bodySize: this.bodySize,
      maxHealth: this.maxHealth,
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
    
    var levelMult = this.speedLevel == 1 ? 1.5 : this.speedLevel == 2 ? 2 : 3;
    if(!mousemove) {
    if(this.controller.left) {
      this.pos.x -= tickDiff * 0.2 * this.speed * this.speedMultiplier * levelMult;
    }
    if(this.controller.right) {
      this.pos.x += tickDiff * 0.2 * this.speed * this.speedMultiplier * levelMult;
    }
    if(this.controller.up) {
      this.pos.y -= tickDiff * 0.2 * this.speed * this.speedMultiplier * levelMult;
    }
    if(this.controller.down) {
      this.pos.y += tickDiff * 0.2* this.speed  * this.speedMultiplier * levelMult;
    }
  } else 

    if(mousemove) {
    var speed = this.speed * this.speedMultiplier * levelMult;

    this.pos.x += Math.cos(this.lookAngle) * speed * tickDiff * 0.2 * this.force;
    this.pos.y += Math.sin(this.lookAngle) * speed * tickDiff * 0.2 * this.force;
    }

    const clamp = (min, max, value) => Math.max(min, Math.min(max, value));
    this.pos.x = clamp(-2000, 2000, this.pos.x);
    this.pos.y = clamp(-2000, 2000, this.pos.y);

    // this.maxHealth = 100 + (this.healthLevel == 1 ? 0 : this.healthLevel == 2 ? 40 : 100);

    if(this.untilNextLevel && this.peppers > this.untilNextLevel) {
      if(levels.length <= this.level) {
        this.canFly = true;
      } else {

      this.level++;
      this.untilNextLevel = levels[this.level-1];
      var choice = this.level % 4;
      if(choice == 0) {
        this.speedLevel++;
        console.log("speed level up");
        this.socket.emit("levelUp", "speed", this.speedLevel);
      } else if(choice == 1) {
        this.sizeLevel++;
        console.log("size");
        this.socket.emit("levelUp", "size", this.sizeLevel);
      } else if(choice == 2) {
        this.bulletLevel++;
        console.log("bullet");
        this.socket.emit("levelUp", "bullet", this.bulletLevel);
      } else if(choice == 3) {
        this.healthLevel++;
        console.log("health");
        this.socket.emit("levelUp", "health", this.healthLevel);
        this.health =  this.maxHealth = 100 + (this.healthLevel == 1 ? 0 : this.healthLevel == 2 ? 40 : 100);
      }
    }
      // this.speedMultiplier = 1;
    }

    if(this.health < this.maxHealth) {
      if(Date.now() - this.lastHit > 5000) {
        //33 because 1000 / 30 (tick speed)
        this.health += this.maxHealth * this.healAmount * (tickDiff / 33);
      }
    }

    this.bodySize = 100 + (this.sizeLevel == 1 ? 0 : this.sizeLevel == 2 ? 50 : 100);
    // console.log(this.bodySize);/

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

    if(!this.down || Date.now() - this.lastShoot < 1000/10) return;
    var room = roomlist.getRoom(this.roomId);
    this.lastShoot = Date.now();
    this.down = false;
    room.bullets.push(new Bullet(this, 0));

    if(this.bulletLevel >= 2) {
    room.bullets.push(new Bullet(this, 10));
    room.bullets.push(new Bullet(this, -10));
    }
    // console.log(this.bulletLevel);

    if(this.bulletLevel >= 3) {
    room.bullets.push(new Bullet(this, 20));
    room.bullets.push(new Bullet(this, -20));
    // console.log("shoot");
    }


  }
}
module.exports = Player;