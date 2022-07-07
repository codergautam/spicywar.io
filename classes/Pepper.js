const intersect = require('intersects');
const idgen = require('../helpers/idgen');
class Pepper {
  constructor(island) {
    this.island = island;
    this.pos = island.getRandomPoint();
    this.id = idgen();
    this.color = island.capturedBy;
  }
  touchingPlayer(player) {
    // console.log(player.pos, this.pos);
    //distance between player and pepper
    if(player.team != this.color) return false;
    var distance = Math.sqrt(Math.pow(player.pos.x - this.pos.x, 2) + Math.pow(player.pos.y - this.pos.y, 2));
    // console.log(distance);
    //if distance is less than radius of player + radius of pepper
    if (distance < player.bodySize + 10) {
      return true;
    } else false
  }
  getSendObject() {
    return {
      pos: this.pos,
      id: this.id,
      color: this.color,
    };
  }
}

module.exports = Pepper;