import Phaser from "phaser";
import GameScene from "../GameScene";
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';


export default class Leaderboard extends Phaser.GameObjects.Container {
  text: BBCodeText;
  constructor(scene: GameScene) {
    super(scene as Phaser.Scene);
   
    this.scene.add.existing(this);
    scene.minimap.ignore(this);
    scene.cameras.main.ignore(this);

    this.text = new BBCodeText(scene, scene.canvas.width, 0, "", {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(1, 0);

    this.add(this.text);

  }
  end() {
    
  }
  preUpdate() {
    var gameScene = this.scene as GameScene;
    var players = [...gameScene.players.values()];
    players = players.sort((a,b) => {
      return b.oldPeppers - a.oldPeppers;
    });
    var text = "[size=32][b]Leaderboard[/b][/size]\n"
    players.forEach((player, i) => {
      text += `[size=20]#${i+1} ${player.name}: ${player.oldPeppers} peppers[/size]\n`;
    });

    this.text.x = gameScene.canvas.width;


    this.text.setText(text);
  }
}