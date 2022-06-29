import Phaser, { Game, Scene } from "phaser";
import GameScene from "../GameScene";
import TeamBox from "./TeamBox";
export default class ClassPicker extends Phaser.GameObjects.Container {
  rect1: TeamBox;
  rect2: TeamBox;
  pickText: Phaser.GameObjects.Text;
  createPickText(gameScene: GameScene) {
    if(this.pickText) this.pickText.destroy();
    this.pickText= new Phaser.GameObjects.Text(gameScene, gameScene.canvas.width / 2, gameScene.canvas.height / 10, "Pick a team", {
      fontSize: `${Math.max(gameScene.canvas.width / 30, 50)}px`,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5, 0.5);
    this.add(this.pickText);
  }
  createRects(gameScene: GameScene) {
    if(this.rect1) this.rect1.destroy();
    if(this.rect2) this.rect2.destroy();
    this.rect1 = new TeamBox(gameScene, gameScene.canvas.width/4, gameScene.canvas.height/6, "red");
    this.rect2 = new TeamBox(gameScene, gameScene.canvas.width/4, this.rect1.y + gameScene.canvas.height/5, "blue");
    //interactive = true;

    this.add(this.rect1);
    this.add(this.rect2);

    
  }
  constructor(scene: GameScene) {
    super(scene as Scene);

var gameScene = this.scene as GameScene;

this.createPickText(gameScene);
this.createRects(gameScene);

this.scene.add.existing(this);
this.scene.cameras.main.ignore(this);
// (this.scene as GameScene).minimap.ignore(this);
  }
  resize() {
  //  console.log("ClassPicker update");

  this.createPickText(this.scene as GameScene);
  this.createRects(this.scene as GameScene);
    
  }
}