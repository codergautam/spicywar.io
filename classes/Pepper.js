const intersect = require('intersects');
const idgen = require('../helpers/idgen');
class Pepper {
  constructor(island) {
    this.island = island;
    this.pos = island.getRandomPoint();
    this.id = idgen();
  }
  touchingPlayer(player) {
    // console.log(player.pos, this.pos);
    //distance between player and pepper
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
    };
  }
}

module.exports = Pepper;