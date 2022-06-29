import Phaser from "phaser";
import GameScene from "../GameScene";
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';


export default class Leaderboard extends Phaser.GameObjects.Container {
  text: any;
  constructor(scene: GameScene) {
    super(scene as Phaser.Scene);
   
    this.scene.add.existing(this);
    scene.minimap.ignore(this);
    scene.cameras.main.ignore(this);

    this.text = new BBCodeText(scene, scene.canvas.width, 0, "Leaderboard", {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(1, 0);

    this.add(this.text);

  }
  end() {
    
  }
  updateObject() {

  }
}