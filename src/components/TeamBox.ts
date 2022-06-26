import Phaser, { Game, Scene } from "phaser";
import GameScene from "../GameScene";
export default class TeamBox extends Phaser.GameObjects.Container {
  rect: Phaser.GameObjects.Rectangle;
  constructor(scene: GameScene, x: number, y: number, team: string) {
    super(scene as Scene);

    this.x = x;
    this.y = y;

   // this.rect = new Phaser.GameObjects.Rectangle(scene, this.x, this.y, 100, 100, 0x00ffff).setOrigin(0.5, 0.5);
    //this.add(this.rect);
  }
  update() {
    //  console.log("ClassPicker update");
  }
}
