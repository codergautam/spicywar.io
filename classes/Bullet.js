const idgen = require("../helpers/idgen");
const intersect = require("intersects");
const io = require("../helpers/io");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Bullet {
  constructor(player, offset) {
    this.speed = player.speed / 2; 
    this.angle = player.lookAngle;
    //cloning the object is necessary because the object is changed in the tick function
    this.pos = JSON.parse(JSON.stringify(player.pos));
    this.pos.x += (Math.cos(this.angle) * this.speed * (50+offset));
    this.pos.y += (Math.sin(this.angle) * this.speed * (50+offset));
    this.createdAt = Date.now();
    this.owner = player.id;
    this.ownerName = player.name;
    this.team = player.team;
    this.roomId = player.roomId;
    this.id = idgen();

    this.length = 5;
    io.getio().to(this.roomId).emit("addBullet", this.getSendObject());
  }
  tick(tickDiff) {
    this.pos.x += Math.cos(this.angle) * this.speed * 50 * (tickDiff / 50);
    this.pos.y += Math.sin(this.angle) * this.speed * 50 * (tickDiff / 50);
  }
  collidingPlayer(entity) {
    if(entity.id == this.owner) return false;



    var corners = entity.getCorners();
    var arr = [];
    corners.forEach(function(corner) {
      arr.push(corner.x);
      arr.push(corner.y);
    });
  
    //check is inside corners
    

    return intersect.circlePolygon(this.pos.x, this.pos.y, this.length, arr);

  }
  collidingBullet(bullet) {
    return intersect.circleCircle(this.pos.x, this.pos.y, this.length, bullet.pos.x, bullet.pos.y, bullet.length);
  }
  getSendObject() {
    return {
      pos: this.pos,
      id: this.id,
      angle: this.angle,
      speed: this.speed,
      owner: this.owner,
    }
  }
}

module.exports = Bullet;