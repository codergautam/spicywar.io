import GameScene from "../GameScene";
import { IslandData } from "../helpers/Packets";
export default class Island extends Phaser.GameObjects.Container {
  island: Phaser.GameObjects.Ellipse;
  shape: string;
  capturedBy: string;
  id: number;
  capturingCircle: Phaser.GameObjects.Ellipse;
  flag: Phaser.GameObjects.Image;
  background: Phaser.GameObjects.Image;
  dir: number;
  lastUpdate: number;
  capturingBy: string;
  constructor(scene: Phaser.Scene, data: IslandData) {
    super(scene);
    this.x = data.pos.x;
    this.y = data.pos.y;
    this.shape = data.shape;
    this.capturedBy = data.capturedBy;
    this.capturingCircle = new Phaser.GameObjects.Ellipse(scene, 0, 0, data.size, data.size, 0x00FFFF).setOrigin(0.5).setVisible(false).setDepth(1);
    this.id = data.id;
    this.dir = 0;
    this.lastUpdate = Date.now();

    this.flag = new Phaser.GameObjects.Image(scene, 0, -200, "redFlag").setOrigin(0.5).setVisible(false).setVisible(false);
    // set scale to island size
    this.flag.setScale(data.size/1000);

    (this.scene as GameScene).minimap.ignore(this.flag);

    this.background = new Phaser.GameObjects.Image(scene, 0, 0, "grass").setOrigin(0.5);
    this.background.setScale(data.size/1900);


    // if(this.capturedBy == "red") console.log(this.id + " is captured by red");
   
    this.island = new Phaser.GameObjects.Ellipse(scene, 0, 0, data.size, data.size, data.capturedBy == "none" ? 0x838579: data.capturedBy == "red" ? 0xFF3632 : 0x009dff).setOrigin(0.5).setDepth(1);
    
    if(data.capturedPercentage < 100) {
      this.setPercent(data.capturedPercentage, data.capturingBy);
    }
    
    this.add(this.island);
    this.add(this.capturingCircle);
    this.add(this.flag);
    if(data.size >= 1000) this.add(this.background);
    this.scene.add.existing(this);
    (this.scene as GameScene).uiCam.ignore(this);

    this.setCurState(data.currentwhat, data.capturedPercentage);
  }
  getDomination() {
    var d = {
      red: 0,
      blue: 0,
      none: 0
    }
    if(this.capturingCircle && this.capturingCircle.visible) {
      d[this.capturingCircle.fillColor == 0xFF3632 ? "red" : "blue"] = this.capturingCircle.scaleX;
      d.none = 1 - d.red - d.blue;
    } else {
      d[this.capturedBy] = 1;
    }
    // console.log(d);
    return d;
  }
  setCurState(state: {state: number, capturedBy: string, capturingBy: string, dir: number}, capturedPercentage: number) {
    this.setTeam(state.capturedBy);
    this.dir = state.dir;
    this.capturingBy = state.capturingBy;
    console.log(state.capturedBy, state.capturingBy);
    this.setPercent(capturedPercentage, state.capturingBy);
  }
  setTeam(team: string) {
    this.capturingCircle.setVisible(false);
    this.island.setFillStyle(team == "red" ? 0xFF3632 : team == "none" ? 0x838579 : 0x009dff);
    this.capturedBy = team;

    this.flag.setTexture(team == "red" ? "redFlag" : "blueFlag");
    if(team != "none") {
      this.flag.setVisible(true);

      // this.flag.setAlpha(0);
      if(!this.scene.tweens.isTweening(this.flag)) {
      this.scene.tweens.add({
        targets: this.flag,
        alpha: 1,
        duration: 1000,
        ease: 'Power2',
      });
    }


    var gameScene = this.scene as GameScene;
    var player = gameScene.players.get(gameScene.socket.id);

    if(player && this.inIsland(player.x, player.y) && player.team == team) {
    var r = gameScene.add.text(gameScene.canvas.width / 2, gameScene.canvas.height / 5, "Island Captured!", {
      fontSize: Math.min(gameScene.canvas.width/10, 70)+"px",
      fontFamily: "Arial",
      color: "#000000",
      align: "center"
    }).setDepth(10).setAlpha(0);
    gameScene.captured.play();
    r.setOrigin(0.5);
    gameScene.cameras.main.ignore(r);
    gameScene.minimap.ignore(r);
    gameScene.tweens.add({
      targets: r,
      alpha: 1,
      onComplete: () => {
        gameScene.tweens.add({
          targets: r,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            r.destroy();
          }
        });
      }
    });
  }
    }
    else {
      this.flag.setAlpha(1);
      if(!this.scene.tweens.isTweening(this.flag)) {
      this.scene.tweens.add({
        targets: this.flag,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.flag.setVisible(false);
        }
      });
    }

      // this.flag.setVisible(false);

    }
  }
  setPercent(percent: number, team: string) {
    console.log(team, percent)
    this.capturingCircle.setFillStyle(team == "red" ? 0xFF3632 : team == "none" ? 0x838579 : 0x0096ff);
    this.capturingCircle.setVisible(true);
    this.capturingCircle.setScale(percent/100);
 
  }
  inIsland(x: number, y: number) {
    //check if point in isalnd
   
    var radius = this.island.displayWidth/2;
    var x2 = this.x;
    var y2 = this.y;
    var dist = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    console.log(dist, radius, dist < radius);
    return dist < radius;
  }
  preUpdate(delta) {
   
    var curPercent = this.capturingCircle.scaleX * 100;
    var diff = Date.now() - this.lastUpdate;
    // console.log(curPercent, this.capturingCircle.scaleX);

    this.lastUpdate = Date.now();

  if(this.capturingBy)  this.setPercent(curPercent + ((diff / 50) * this.dir), this.capturingBy);






    // this.setPercent()
  }
}

