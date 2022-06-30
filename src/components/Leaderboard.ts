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

    this.text = new BBCodeText(scene, scene.canvas.width-10, 0, "", {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center'
    }).setOrigin(1, 0);
    this.text.addImage("pepper", {
      key: "pepper",
      width: 20,
      height: 20
    });

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
    var text = `[size=${gameScene.canvas.width / 50}][b]Leaderboard[/b][/size]\n`
    var here = false;
    players.forEach((player, i) => {
      if(i < 10) {
        if(player.id == gameScene.socket.id) here = true;
        text += `[size=20]#${i+1} - [color=${player.team == "red" ? "red" : "blue"}]${player.name}[/color]: ${player.oldPeppers}\n`;
      } else if (here == false && player.id == gameScene.socket.id) {
        text += `[size=20]...\n#${i+1} - [color=${player.team == "red" ? "red" : "blue"}]${player.name}[/color]: ${player.oldPeppers}\n`;
        here = true;
      }

      });

    this.text.x = gameScene.canvas.width-10;


    this.text.setText(text);
  }
}