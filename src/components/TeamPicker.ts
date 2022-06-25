import Phaser, { Game, Scene } from "phaser";
import GameScene from "../GameScene";
export default class ClassPicker extends Phaser.GameObjects.Container {
  rect1: Phaser.GameObjects.Rectangle;
  constructor(scene: GameScene) {
    super(scene as Scene);


this.rect1 = new Phaser.GameObjects.Rectangle(scene, scene.canvas.width / 2, (scene.canvas.height / 4), 100, 100, 0x00FFFF);
this.add(this.rect1);
this.scene.add.existing(this);
this.scene.cameras.main.ignore(this);
  }
  update() {
  //  console.log("ClassPicker update");
    
  }
}