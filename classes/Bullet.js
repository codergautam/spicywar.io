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
    if(player.needsFlip) {
      this.angle -= (Math.PI / 2) - 0.2;
    }
    const convert = (num, val, newNum) => (newNum * val) / num
    const multiplier = convert(100, 75, player.bodySize);
    this.pos.x += (Math.cos(this.angle + Math.PI / 4) * this.speed * (multiplier));
    this.pos.y += (Math.sin(this.angle + Math.PI / 4) * this.speed * (multiplier));

    var mult = player.speedLevel == 1 ? 1 : player.speedLevel == 2 ? 1.5 : 2;
    this.speed = player.speed /1.5;
    this.speed *= mult;
    // console.log(offset)
    this.angle = player.lookAngle - 0.3 + (offset * Math.PI / 180);
    if(player.needsFlip) {
      this.angle += (Math.PI / 2) - 1;
    }
    
    this.createdAt = Date.now();
    this.owner = player.id;
    this.damage = player.damage;
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
    // return intersect.circleCircle(this.pos.x, this.pos.y, this.length, bullet.pos.x, bullet.pos.y, bullet.length);
    return false;
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