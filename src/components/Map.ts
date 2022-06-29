import Phaser from "phaser";
import GameScene from "../GameScene";

export default class GameMap extends Phaser.GameObjects.Container {
  islands: Phaser.GameObjects.Rectangle[];
  graphics: Phaser.GameObjects.Graphics;
  constructor(scene: GameScene) {
    super(scene as Phaser.Scene);
   
    this.scene.add.existing(this);

    //draw boundary
    var map = 2000

    this.graphics = new Phaser.GameObjects.Graphics(scene);
    scene.uiCam.ignore(this);
    this.graphics.lineStyle(10, scene.team == "red" ? 0xFF0000 : 0x0000FF);
    this.graphics.strokeRect(-1*map, -1*map, map*2, map*2);
    this.graphics.lineStyle(2000, scene.team == "red" ? 0x8b0000 : 0x00008b);
    this.graphics.strokeRect(-1*map-1000, (-1*map)-1000, (map*2)+2000, (map*2)+2000);
    this.add(this.graphics);
    
  }
  end() {
    
  }
  updateObject() {

  }
}