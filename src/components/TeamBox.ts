import Phaser, { Game, Scene } from "phaser";
import GameScene from "../GameScene";
export default class TeamBox extends Phaser.GameObjects.Container {
  rect: Phaser.GameObjects.Rectangle;
  image: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  lastUpdate: number;
  lastRefresh: number;
  constructor(scene: GameScene, x: number, y: number, team: string) {
    super(scene as Scene);
    this.lastUpdate = Date.now();
    this.lastRefresh = Date.now();
    this.x = x;
    this.y = y;

    this.rect = new Phaser.GameObjects.Rectangle(scene, this.x, this.y, Math.min(scene.canvas.width / 1.5, 800), scene.canvas.height / 3, 0x00ffff).setOrigin(0.5, 0.5).setDepth(1);
    this.image = new Phaser.GameObjects.Image(scene, this.x-10, this.y, team+"Dragon").setOrigin(0.5, 0.5).setDepth(2);
    var text = team;
    this.text = new Phaser.GameObjects.Text(scene, this.x, this.y -10, text, {
      fontSize: Math.min(scene.canvas.width / 20, 70)+"px",
      color: team == "red" ? "#ff0000" : "#0000FF",
      align: "center",
      fontFamily: "Finlandica",
    }).setDepth(3).setOrigin(0, 0.5);
    this.setData("team\nplayers", team);
    while (this.image.displayHeight > this.rect.displayHeight / 1.7 || this.image.displayWidth > this.rect.displayWidth/1.2) {
      // console.log("resizing");
      this.image.scaleX -= 0.01;
      this.image.scaleY -= 0.01;
    }
    this.image.x -= this.text.displayWidth / 2;
    this.add(this.rect);
    this.add(this.image);
    this.add(this.text);
    fetch('/teams').then(res => res.json()).then(teams => {
      this.lastUpdate = Date.now();
      this.text.destroy();
      this.text = new Phaser.GameObjects.Text(scene, this.x, this.y -10, teams[team].playerCount+" players", {
        fontSize: Math.min(scene.canvas.width / 20, 70)+"px",
        color: team == "red" ? "#ff0000" : "#0000FF",
        align: "center",
        fontFamily: "Finlandica",
      }).setDepth(3).setOrigin(0, 0.5);
      this.add(this.text);
    
      text = (team +"\n"+teams[team].playerCount+" players");
      // console.log(teams);
      this.text.setText(text);
      this.setData("team", team);

      this.setData("count", teams[team].playerCount);
      var oppositeTeamCount = teams[team == "red" ? "blue" : "red"].playerCount;
      this.setData("oppositeCount", oppositeTeamCount);

      if((oppositeTeamCount == 0 && this.getData("count") != 0)|| (this.getData("count") - oppositeTeamCount >= 2 && oppositeTeamCount != 0)) {
        this.rect.setFillStyle(0x808080);
      }
  
  
     // this.text.x += this.image.displayWidth;
  
     this.image.x -= this.text.displayWidth / 2;
  
      this.rect.setInteractive();
  

    })
 

  }
  preUpdate() {
    //  console.log("ClassPicker update");
    // console.log(Date.now() - this.lastUpdate, Date.now() - this.lastRefresh)
    if(Date.now() - this.lastUpdate > 500 && Date.now() - this.lastRefresh > 500 && this.rect && this.rect.visible ) {
      // console.log("Hiding");
      this.lastUpdate = Date.now();

      fetch('/teams').then(res => res.json()).then(teams => {
        this.lastRefresh = Date.now();
        // console.log(teams)

        this.setData("count", teams[this.getData("team")].playerCount);
        var oppositeTeamCount = teams[this.getData("team") == "red" ? "blue" : "red"].playerCount;
        this.setData("oppositeCount", oppositeTeamCount);
        this.text.setText(this.getData("team") +"\n"+this.getData("count")+" players");
        if((oppositeTeamCount == 0 && this.getData("count") != 0)|| (this.getData("count") - oppositeTeamCount >= 2 && oppositeTeamCount != 0)) {
          this.rect.setFillStyle(0x808080);
        } else {
          this.rect.setFillStyle(0x00ffff);
        }
      });
    }


  }
}
