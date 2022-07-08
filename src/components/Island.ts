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
  constructor(scene: Phaser.Scene, data: IslandData) {
    super(scene);
    this.x = data.pos.x;
    this.y = data.pos.y;
    this.shape = data.shape;
    this.capturedBy = data.capturedBy;
    this.capturingCircle = new Phaser.GameObjects.Ellipse(scene, 0, 0, data.size, data.size, 0x00FFFF).setOrigin(0.5).setVisible(false).setDepth(1);
    this.id = data.id;

    this.flag = new Phaser.GameObjects.Image(scene, 0, -200, "redFlag").setOrigin(0.5).setVisible(false).setVisible(false);
    // set scale to island size
    this.flag.setScale(data.size/1000);

    (this.scene as GameScene).minimap.ignore(this.flag);

    this.background = new Phaser.GameObjects.Image(scene, 0, 0, "grass").setOrigin(0.5);
    this.background.setScale(data.size/1900);


    // if(this.capturedBy == "red") console.log(this.id + " is captured by red");
    this.island = new Phaser.GameObjects.Ellipse(scene, 0, 0, data.size, data.size, data.capturedBy == "none" ? 0x838579: data.capturedBy == "red" ? 0xFF0000 : 0x0000FF).setOrigin(0.5).setDepth(1);
    
    if(data.capturedPercentage < 100) {
      this.setPercent(data.capturedPercentage, data.capturingBy);
    }
    
    this.add(this.island);
    this.add(this.capturingCircle);
    this.add(this.flag);
    if(data.size >= 1000) this.add(this.background);
    this.scene.add.existing(this);
    (this.scene as GameScene).uiCam.ignore(this);
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
    // console.log(team)
    this.capturingCircle.setFillStyle(team == "red" ? 0xFF3632 : team == "none" ? 0x838579 : 0x0096ff);
    this.capturingCircle.setVisible(true);
    this.capturingCircle.setScale(percent/100);
  }

}

