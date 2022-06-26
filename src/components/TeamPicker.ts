import Phaser, { Game, Scene } from "phaser";
import GameScene from "../GameScene";
import TeamBox from "./TeamBox";
export default class ClassPicker extends Phaser.GameObjects.Container {
  rect1: TeamBox;
  constructor(scene: GameScene) {
    super(scene as Scene);

var gameScene = this.scene as GameScene;
this.rect1 = new TeamBox(gameScene, gameScene.canvas.width/4, gameScene.canvas.height/4, "red");
this.add(this.rect1);
this.scene.add.existing(this);
this.scene.cameras.main.ignore(this);
  }
  update() {
  //  console.log("ClassPicker update");
    
  }
}