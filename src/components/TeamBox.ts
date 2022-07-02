import Phaser, { Game, Scene } from "phaser";
import GameScene from "../GameScene";
export default class TeamBox extends Phaser.GameObjects.Container {
  rect: Phaser.GameObjects.Rectangle;
  image: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  constructor(scene: GameScene, x: number, y: number, team: string) {
    super(scene as Scene);

    this.x = x;
    this.y = y;

    this.rect = new Phaser.GameObjects.Rectangle(scene, this.x, this.y, Math.min(scene.canvas.width / 1.5, 800), scene.canvas.height / 3, 0x00ffff).setOrigin(0.5, 0.5).setDepth(1);
    this.image = new Phaser.GameObjects.Image(scene, this.x-10, this.y, team+"Dragon").setOrigin(0.5, 0.5).setDepth(2);
    var text = "";
    fetch('/teams').then(res => res.json()).then(teams => {
      text = (team +"\n"+teams[team].playerCount+" players");
      console.log(teams);
      this.text = new Phaser.GameObjects.Text(scene, this.x, this.y -10, text, {
        fontSize: Math.min(scene.canvas.width / 20, 70)+"px",
        color: team == "red" ? "#ff0000" : "#0000FF",
        align: "center",
        fontFamily: "Finlandica",
      }).setDepth(3).setOrigin(0, 0.5);
      this.setData("count", teams[team].playerCount);
      var oppositeTeamCount = teams[team == "red" ? "blue" : "red"].playerCount;
      this.setData("oppositeCount", oppositeTeamCount);

      if((oppositeTeamCount == 0 && this.getData("count") != 0)|| (this.getData("count") - oppositeTeamCount >= 2 && oppositeTeamCount != 0)) {
        this.rect.setFillStyle(0x808080);
      }
  
      while (this.image.displayHeight > this.rect.displayHeight / 1.7 || this.image.displayWidth > this.rect.displayWidth/1.2) {
        // console.log("resizing");
        this.image.scaleX -= 0.01;
        this.image.scaleY -= 0.01;
      }
     // this.text.x += this.image.displayWidth;
  
      this.image.x -= this.text.displayWidth / 2;
  
      this.rect.setInteractive();
  
      this.add(this.rect);
      this.add(this.image);
      this.add(this.text);
    })
 

  }
  update() {
    //  console.log("ClassPicker update");

  }
}
