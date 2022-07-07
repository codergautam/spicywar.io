const intersect = require("intersects");
const io = require("../helpers/io");  
const idgen = require("../helpers/idgen");
const Pepper = require("./Pepper");
module.exports = class Island {
  constructor(shape, size, position, canBeCaptured = true) {
    this.shape = shape;
    this.size = size;
    this.pos = position;
    this.canBeCaptured = canBeCaptured;
    this.capturedBy = "none";
    this.captureState = 0;
    this.destroyingBy = "none";
    // state 0 = not capturing
    // state 1 = capturing
    // state 2 = captured
    // state 4 = destroying
    this.capturingBy = 0.1;
    this.lastPepperGrew = Date.now();
    this.id = idgen();
    this.capturedPercentage = 0;
  }
  pepperGrew(room) {
    this.lastPepperGrew = Date.now();
    
    if(this.canBeCaptured && this.captureState == 2 && this.capturedBy != "none" && this.getPepperCount(room) < 10) {
      const pepper = new Pepper(this);
     room.peppers.set(pepper.id, pepper);
    }

  }
  getPeppers(room) {
    return [...room.peppers.values()].filter(pepper => this.isIn(pepper.pos));
  }
  getPepperCount(room) {
    return this.getPeppers(room).length;
  }
  clearOtherPeppers(room) {
    this.getPeppers(room).forEach(pepper => {
      if(pepper.color != this.capturedBy) {
        room.peppers.delete(pepper.id);
        io.getio().to(room.id).emit("pepperCollected", pepper.id);
      }
    }
    );
  }
  getRandomPoint(multiply=1) {
   var radius = ((this.size * multiply) /2) * Math.sqrt(Math.random());
    var angle = Math.random() * 2 * Math.PI;
    var x = this.pos.x + (radius * Math.cos(angle));
    var y = this.pos.y +( radius * Math.sin(angle));
    return {x: x, y: y};
  }
  getSendObject() {
    return {
      shape: this.shape,
      size: this.size,
      pos: this.pos,
      capturedBy: this.capturedBy,
      id: this.id,
      capturedPercentage: this.capturedPercentage,
      capturingBy: this.capturingBy,
      people: this.people,
    }
  }
  tick(diff, room) {
    if(!this.canBeCaptured) return;

    var players = Array.from(room.players.values()).filter(player => this.isIn(player.pos));
    this.people = players.map(player => player.id);
    io.getio().to(room.id).emit("islandUpdate", this.getSendObject());
    if(this.lastPepperGrew + 1000 < Date.now()) this.pepperGrew(room);

    if(players.length < 1) {
      
      if(this.captureState == 1) {
        this.capturedPercentage -= (diff / 50);
        if(this.capturedPercentage <= 0) {
          this.captureState = 0;
          this.capturedPercentage = 0;
          this.capturedBy = "none";
          this.capturingBy = "none";
        }
      }

      if(this.captureState == 4) {
        this.capturedPercentage += (diff / 50);
        if(this.capturedPercentage >= 100) {
          this.capturedBy = this.capturingBy;
          this.captureState = 2;
          this.clearOtherPeppers(room);
        }
      }

    } else {

    //make sure everyone on the island is on the same team
    if(!players.every((player) => player.team == players[0].team)) {
      return;
    }

    var team = players[0].team;
    var count = players.length;

    if(this.captureState == 0) {
      this.captureState = 1;
      this.capturingBy = team; 
    }

    if(this.captureState == 1) {
      if (this.capturingBy == team) {
      this.capturedPercentage += (diff / 50) * count;
      if(this.capturedPercentage >= 100) {
        this.captureState = 2;
        this.clearOtherPeppers(room);
        this.capturedBy = team;
        this.capturingBy = team;
        this.capturedPercentage = 100;
      }
    }  else {
      this.capturedPercentage -= (diff / 50) * count;
      if(this.capturedPercentage <= 0) {
        this.captureState = 0;
        this.capturedPercentage = 0;
        this.capturedBy = "none";
        this.capturingBy = "none";
      }
    }
    }

    if(this.captureState == 2 && this.capturedBy != team) {
      this.captureState = 4;
      this.capturedBy = "none";
      this.destroyingBy = team;
    }

    if(this.captureState == 4) {
     if(this.destroyingBy == team) {
      this.capturedPercentage -= (diff / 50) * count;
      if(this.capturedPercentage <= 0) {
        this.captureState = 0;
        this.capturedBy = "none";
        this.capturingBy = "none";
        this.capturedPercentage = 0;
      }
     }
     else {
      this.capturedPercentage += (diff / 50) * count;
      if(this.capturedPercentage >= 100) {
        this.captureState = 2;
        this.clearOtherPeppers(room);
        this.capturedBy = team;
        this.capturingBy = team;
        this.capturedPercentage = 100;
      }
     }


    }
  }
    
  }
  getDomination() {
    var domination = {
      red: 0,
      blue: 0,
      none: 0
    }
    // if(this.captureState == 0) domination.none+=100;
    if(this.captureState == 1 || this.capturingBy != this.capturedBy) {
      if(this.capturingBy == "red") domination.red+=this.capturedPercentage;
      else if(this.capturingBy == "blue") domination.blue+=this.capturedPercentage;

      domination.none+=100-this.capturedPercentage;
    } else if(this.captureState == 2) {
      if(this.capturedBy == "red") domination.red+=100;
      else domination.blue+=100;
    }
    return domination;
  }
 isIn(pos) {
      return intersect.pointCircle(pos.x, pos.y, this.pos.x, this.pos.y, this.size/2); 
  }
}