const intersect = require("intersects");
module.exports = class Bridge {
  constructor(island1, island2, width) {
    this.island1 = island1;
    this.island2 = island2;     
    this.width = width;
    this.length = Math.sqrt(Math.pow(this.island1.pos.x - this.island2.pos.x, 2) + Math.pow(this.island1.pos.y - this.island2.pos.y, 2));

    // calculate angle
    this.angle = Math.atan2(island2.pos.y - island1.pos.y, island2.pos.x - island1.pos.x)+Math.PI/2;
    //to degrees
    console.log( this.angle * 180 / Math.PI);
  }
  getSendObject() {
    return {
      width: this.width,
      length: this.length,
      angle: this.angle,
      pos: this.getCorners()[2],
      corners: [this.getCorners()[2]],
    };
  }
  getCorners(extraDiff = 1) {
        // find 4 corners of the bridge, make sure to use the angle and width
        var newWidth = this.width * extraDiff;
       var corners = [];
        corners.push({
          x: this.island1.pos.x + Math.cos(this.angle) * newWidth,
          y: this.island1.pos.y + Math.sin(this.angle) * newWidth,
        });
        corners.push({
          x: this.island1.pos.x - Math.cos(this.angle) * newWidth,
          y: this.island1.pos.y - Math.sin(this.angle) * newWidth,
        });
        corners.push({
          x: this.island2.pos.x - Math.cos(this.angle) * newWidth,
          y: this.island2.pos.y - Math.sin(this.angle) * newWidth,
        });
        corners.push({
          x: this.island2.pos.x + Math.cos(this.angle) * newWidth,
          y: this.island2.pos.y + Math.sin(this.angle) * newWidth,
        });
        return corners;
  }
  isIn(player) {
    // check if pos is in the bridge
    var corners = [];
    var u = this.getCorners()
    u.forEach(corner => {
      corners.push(corner.x);
      corners.push(corner.y);
    });
    var center = player.getCenterPoint();

    return intersect.pointPolygon(center.x, center.y, corners);
  }
}