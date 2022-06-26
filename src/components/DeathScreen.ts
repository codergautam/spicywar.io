import { Game, Scene } from "phaser";
import GameScene from "../GameScene";
import ImgButton from "./PhaserImgButton";

function msToTime(duration: number) {
  const portions = [];

  const msInHour = 1000 * 60 * 60;
  const hours = Math.trunc(duration / msInHour);
  if (hours > 0) {
    portions.push(hours + 'h');
    duration = duration - (hours * msInHour);
  }

  const msInMinute = 1000 * 60;
  const minutes = Math.trunc(duration / msInMinute);
  if (minutes > 0) {
    portions.push(minutes + 'm');
    duration = duration - (minutes * msInMinute);
  }

  const seconds = Math.trunc(duration / 1000);
  if (seconds > 0) {
    portions.push(seconds + 's');
  }

  return portions.join(' ');
}

export default class DeathScreen extends Phaser.GameObjects.Container {
  box: Phaser.GameObjects.Rectangle;
  deadText: Phaser.GameObjects.Text;
  reason: string;
  moreData: Phaser.GameObjects.Text;
  who: string;
  survivedTime: number;
  shotDragons: any;
  peppers: any;
  respawnbutton: ImgButton;
  homebutton: ImgButton;
  constructor(scene: GameScene, reason: string = "drown", who: string = null, survivedTime: number = 1000, shotDragons: number = 0, peppers: number = 0) {
    super(scene as Scene);

    this.render(scene)

    this.reason = reason;
    this.who = who;
    this.survivedTime = survivedTime;
    this.peppers = peppers;
    this.shotDragons = shotDragons;

    scene.cameras.main.ignore(this);
    this.scene.add.existing(this);
  }
  render(scene: GameScene) {

    if(this.box) this.box.destroy();
    if(this.deadText) this.deadText.destroy();
    if(this.moreData) this.moreData.destroy();
    if(this.respawnbutton) this.respawnbutton.destroy();
    if(this.homebutton) this.homebutton.destroy();

    this.box = new Phaser.GameObjects.Rectangle(scene, scene.canvas.width / 2, scene.canvas.height / 2, scene.canvas.width / 2, scene.canvas.height / 1.5, 0xffffff);
    this.deadText = new Phaser.GameObjects.Text(scene, scene.canvas.width / 2, scene.canvas.height / 2, "You died", {
      fontSize: Math.max(scene.canvas.width / 25, 40) + "px",
      color: "#ff0000",
      align: "center",
      fontFamily: "Arial"

    }).setOrigin(0.5, 0);
    
    this.moreData = new Phaser.GameObjects.Text(scene, scene.canvas.width / 2, this.deadText.y + scene.canvas.height / 10, (this.reason == "drown" ? this.who === null ? "You fell into the water!" : "Shot into water by "+this.who : "You were shot by "+this.who)+`\n\nSurvived Time: $0s\nDragons shot: 0\nPeppers collected: 0`, {
      fontSize: Math.max(scene.canvas.width /40, 20) + "px",
      color: "#ff0000",
      align: "center",
      fontFamily: "Arial"
    }).setOrigin(0.5, 0);

    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        var value = tween.getValue();
        // console.log(value);
        this.moreData.setText((this.reason == "drown" ? this.who === null ? "You fell into the water!" : "Shot into water by "+this.who : "You were shot by "+this.who)+`\n\nSurvived Time: ${msToTime(this.survivedTime * (value / 100))}\nDragons shot: ${Math.round(this.shotDragons * (value/100))}\nPeppers collected: ${Math.ceil(this.peppers*(value/100))}`)
      },
      duration: 1000,
      ease: 'Linear',
    });


    this.deadText.y -= this.box.displayHeight / 2.3;
    this.moreData.y -= this.box.displayHeight / 2.3;

    this.respawnbutton = new ImgButton(scene as Phaser.Scene, scene.canvas.width / 2, this.box.displayHeight, "again", () => {
      (this.scene as GameScene).callback();
      (this.scene as GameScene).socket.disconnect();
      (this.scene as GameScene).scene.restart();
    });
    this.homebutton = new ImgButton(scene as Phaser.Scene, scene.canvas.width / 2, this.box.displayHeight + (this.respawnbutton.btn.displayHeight/2), "home", () => {
      (this.scene as GameScene).callback();
      (this.scene as GameScene).socket.disconnect();
      (this.scene as GameScene).scene.start("title");
    });

    

    console.log(this.box.displayWidth, this.respawnbutton.btn.disp);
    while (this.respawnbutton.btn.displayWidth > this.box.displayWidth || this.respawnbutton.btn.displayHeight > this.box.displayHeight / 7) {
      this.respawnbutton.btn.setScale(this.respawnbutton.btn.scaleX - 0.01);
    }
    while (this.homebutton.btn.displayWidth > this.box.displayWidth || this.homebutton.btn.displayHeight > this.box.displayHeight / 7) {
      this.homebutton.btn.setScale(this.homebutton.btn.scaleX - 0.01);
    }

    this.respawnbutton.y = this.box.displayHeight;
    this.homebutton.y = this.respawnbutton.y + this.respawnbutton.btn.displayHeight - 5;

    

    

    this.add(this.box);
   
    this.add(this.deadText);
    this.add(this.respawnbutton);
    this.add(this.homebutton);

    this.add(this.moreData);
  }
  resize() {
    this.render(this.scene as GameScene);

  }
}