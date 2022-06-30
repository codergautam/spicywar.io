import GameScene from "../GameScene";
import { IslandData } from "../helpers/Packets";
export default class Island extends Phaser.GameObjects.Container {
  island: Phaser.GameObjects.Ellipse;
  shape: string;
  capturedBy: string;
  id: number;
  capturingCircle: Phaser.GameObjects.Ellipse;
  constructor(scene: Phaser.Scene, data: IslandData) {
    super(scene);
    this.x = data.pos.x;
    this.y = data.pos.y;
    this.shape = data.shape;
    this.capturedBy = data.capturedBy;
    this.capturingCircle = new Phaser.GameObjects.Ellipse(scene, 0, 0, data.size, data.size, 0x00FFFF).setOrigin(0.5).setVisible(false).setDepth(1);
    this.id = data.id;

    // if(this.capturedBy == "red") console.log(this.id + " is captured by red");
    this.island = new Phaser.GameObjects.Ellipse(scene, 0, 0, data.size, data.size, data.capturedBy == "none" ? 0x838579: data.capturedBy == "red" ? 0xFF0000 : 0x0000FF).setOrigin(0.5).setDepth(1);
    
    if(data.capturedPercentage < 100) {
      this.setPercent(data.capturedPercentage, data.capturingBy);
    }
    
    this.add(this.island);
    this.add(this.capturingCircle);
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
  }
  setPercent(percent: number, team: string) {
    // console.log(team)
    this.capturingCircle.setFillStyle(team == "red" ? 0xFF3632 : team == "none" ? 0x838579 : 0x0096ff);
    this.capturingCircle.setVisible(true);
    this.capturingCircle.setScale(percent/100);
  }

}

