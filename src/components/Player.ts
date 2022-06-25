import Phaser from "phaser";
import GameScene from "../GameScene";
import { PlayerData } from "../helpers/Packets";
export default class Player extends Phaser.GameObjects.Container {
  square: Phaser.GameObjects.Rectangle;
  gun: Phaser.GameObjects.Rectangle;
  bodySize: number;
  lastTick: number;
  toAngle: number;
  lastUpdate: number;
  id: string;
  name: string;
  speed: number;
  team: string;
  nameTag: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, x: number, y: number, id: string, name: string, team: string, speed: number = 1, size: number = 50) {
    super(scene);
    this.x = x;
    this.y = y;
    this.bodySize = size;
    this.lastTick = Date.now();
    this.lastUpdate = Date.now();

    this.id = id;
    this.name = name;
    this.speed = speed;

    this.team = team;
    // alert(size)/
    this.square = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.bodySize, this.bodySize, team == "red" ? 0x013220: 0x0000FF).setOrigin(0.5);
    this.gun = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.bodySize/2, this.bodySize/2, team == "red" ? 0xff0000 : 0x00FFFF).setOrigin(0.5);
    this.nameTag = new Phaser.GameObjects.Text(scene, 0, -1 * this.square.displayHeight, name, {
      fontSize: "20px",
      color: team == "red" ? "#ff0000" : "#00FFFF",
      align: "center"
    }).setDepth(5).setOrigin(0.5);

    this.toAngle =this.square.rotation;

    this.add(this.square);
    this.add(this.gun);
   if(this.id != (this.scene as GameScene).socket.id) this.add(this.nameTag);
    this.scene.add.existing(this);
    (this.scene as GameScene).uiCam.ignore(this);
  }
  tick(data: PlayerData, hit: boolean) {
    this.toAngle = data.lookAngle;
    this.scene.tweens.add({
      targets: this,
      x: data.pos.x,
      y: data.pos.y,
      duration: hit ? 500 : 100,
      ease: "Power2",
      repeat: 0,
      yoyo: false,
    });
  

    this.lastTick = Date.now();

  }
  updateObject() {
    var tickDiff = Date.now() - this.lastUpdate;
    function rLerp (A: number, B: number, w: number){
      let CS = (1-w)*Math.cos(A) + w*Math.cos(B);
      let SN = (1-w)*Math.sin(A) + w*Math.sin(B);
      return Math.atan2(SN,CS);
  }

   if((this.scene as GameScene).socket.id != this.id) this.square.setRotation(rLerp(this.square.rotation, this.toAngle, 0.5));
   else this.square.setRotation((this.scene as GameScene).mouseAngle);
   
   this.gun.setRotation(this.square.rotation);
   this.gun.x = Math.cos(this.square.rotation) * this.bodySize/2;
   this.gun.y = Math.sin(this.square.rotation) * this.bodySize/2;

  //  if(this.id == (this.scene as GameScene).socket.id) {
  //   var controller = (this.scene as GameScene).controller;
  //   if(controller.left) {
  //     this.x -= tickDiff * 0.2 * this.speed;
  //   }
  //   if(controller.right) {
  //     this.x += tickDiff * 0.2 * this.speed;
  //   }
  //   if(controller.up) {
  //     this.y -= tickDiff * 0.2 * this.speed;
  //   }
  //   if(controller.down) {
  //     this.y += tickDiff * 0.2* this.speed;
  //   }
  //   this.lastUpdate = Date.now();
  //  }
  }
}