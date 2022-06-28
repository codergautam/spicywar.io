import Phaser from "phaser";
import GameScene from "../GameScene";
import { BulletData, Data } from "../helpers/Packets";

export default class Bullet extends Phaser.GameObjects.Container {
  id: string;
  bullet: Phaser.GameObjects.Rectangle;
  lastRecievedData: number;
  goTo: { x: number; y: number; };
  speed: number;
  mAngle: number;
  lastUpdate: number;
  constructor(scene: Phaser.Scene, data: BulletData) {
    super(scene);
    this.id = data.id;
    this.x = data.pos.x;
    this.y = data.pos.y;

    this.speed = data.speed;
    this.mAngle = data.angle;

    this.goTo = {
      x: data.pos.x,
      y: data.pos.y
    }


    this.bullet = new Phaser.GameObjects.Ellipse(scene, 0, 0, 10, 10, 0x00FFFF).setOrigin(0.5);
    this.bullet.setRotation(data.angle+(Math.PI/2));
    this.lastRecievedData = Date.now();
    this.add(this.bullet);
    (this.scene as GameScene).uiCam.ignore(this);
    this.scene.add.existing(this);

    this.lastUpdate = Date.now();

 //   this.visible = false;
  }
  updateObject() {
   
    this.x += Math.cos(this.mAngle) * this.speed * 50 * ((Date.now() - this.lastUpdate) / 50);
    this.y += Math.sin(this.mAngle) * this.speed * 50 * ((Date.now() - this.lastUpdate) / 50);
    
    this.lastUpdate = Date.now();

  }
}