import Phaser from "phaser";
import GameScene from "../GameScene";
import { PlayerData } from "../helpers/Packets";
import HealthBar from "./HealthBar";

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
  healthBar: HealthBar;
  oldPeppers: number;
  image: Phaser.GameObjects.Image;
  needsFlip: boolean;
  realScaleX: number;
  oldLevel: number;
  oldUntilNextLevel: number[];
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    name: string,
    team: string,
    speed: number = 1,
    size: number = 50
  ) {
    super(scene);
    this.x = x;
    this.y = y;
    this.bodySize = size;
    this.lastTick = Date.now();
    this.lastUpdate = Date.now();


    this.id = id;
    this.name = name;
    this.speed = speed;

    this.oldLevel = 1;

    this.team = team;
    // alert(size)/
    // this.square = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.bodySize, this.bodySize, team == "red" ? 0xFF0000: 0x0000FF).setOrigin(0.5);
    // this.gun = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.bodySize/2, this.bodySize/2, team == "red" ? 0xffcccb : 0x00FFFF).setOrigin(0.5);
    this.image = new Phaser.GameObjects.Image(
      scene,
      0,
      0,
      team == "red" ? "redDragon" : "blueDragon"
    ).setOrigin(0.5);

    this.realScaleX = 0.5;
    this.image.setScale(this.realScaleX);

    // this.image.;
    this.nameTag = new Phaser.GameObjects.Text(
      scene,
      0,
      -0.75 * this.image.displayHeight,
      name,
      {
        fontSize: "20px",
        color: team == "red" ? "#ff0000" : "#00FFFF",
        align: "center",
      }
    )
      .setDepth(5)
      .setOrigin(0.5);



    if (this.id == (this.scene as GameScene).socket.id)
      this.healthBar = new HealthBar(
        scene,
        0,
        -0.6 * (this.image.displayHeight / 2),
        75,
        10,
        false
      ).setDepth(99);
    else
      this.healthBar = new HealthBar(
        scene,
        0,
        -0.6 * (this.image.displayHeight / 2),
        75,
        10,
        false
      ).setDepth(99);

    this.healthBar.x -= this.healthBar.displayWidth / 4;

    this.healthBar.setHealth(100);

    this.toAngle = 0;

    // this.add(this.square);
    // this.add(this.gun);
    this.add(this.image);
    this.add(this.healthBar);
    if (this.id != (this.scene as GameScene).socket.id) this.add(this.nameTag);
    this.scene.add.existing(this);
    (this.scene as GameScene).uiCam.ignore(this);
  }
  tick(data: PlayerData, hit: boolean) {
    this.toAngle = data.lookAngle + Math.PI + 0.35;
    // if(this.needsFlip) this.toAngle -= Math.PI - 0.6;
    this.lastTick = Date.now();
    // this means we just got some data about this player
    this.scene.tweens.add({
      targets: this,
      x: data.pos.x,
      y: data.pos.y,
      duration: hit ? 200 : 100,
      ease: "Power2",
      onComplete: () => {
      
      }
    });

    if(this.id == (this.scene as GameScene).socket.id) {
      if(!this.oldUntilNextLevel) this.oldUntilNextLevel = [data.untilNextLevel];
      if(this.oldLevel != data.level) {
        (this.scene as GameScene).spicyMeter.setLerpValue(0);
        console.log("level up");
        this.oldUntilNextLevel.push(data.untilNextLevel);
      }
      // console.log(data.peppers/data.untilNextLevel*100);
      //oldlevels sum
      let sum = 0;
      if(this.oldUntilNextLevel.length > 1) sum = this.oldUntilNextLevel[this.oldUntilNextLevel.length - 2];
      (this.scene as GameScene).spiceText.setText("🌶️  Spice Level: "+data.level+" ("+Math.round((data.peppers - sum)/(data.untilNextLevel - sum)*100)+"%)");

      (this.scene as GameScene).spicyMeter.setLerpValue((data.peppers - sum)/(data.untilNextLevel - sum)*100);
      this.oldLevel = data.level;
    }

    if(this.id == (this.scene as GameScene).socket.id) {

    (this.scene as GameScene).killCount.setText("[img=pepper] " + data.peppers);


    if(this.oldPeppers != data.peppers) {
      this.scene.tweens.add({
        targets: (this.scene as GameScene).killCount,
        duration: 200,
        scaleX: 1.2,
        scaleY: 1.2,
        ease: "Power2",
        onComplete: () => {
          this.scene.tweens.add({
            targets: (this.scene as GameScene).killCount,
            duration: 200,
            scaleX: 1,
            scaleY: 1,
            ease: "Power2"
          });
        }
      });

    }
    }

    this.oldPeppers = data.peppers;



    if (data.health) this.healthBar.setLerpValue(data.health);

    this.lastTick = Date.now();
  } 
  updateObject() {
    var tickDiff = Date.now() - this.lastUpdate;
    function rLerp(A: number, B: number, w: number) {
      let CS = (1 - w) * Math.cos(A) + w * Math.cos(B);
      let SN = (1 - w) * Math.sin(A) + w * Math.sin(B);
      return Math.atan2(SN, CS);
    }

    if ((this.scene as GameScene).socket.id != this.id)
    
      // this.image.setRotation(this.toAngle + (this.needsFlip ? Math.PI - 0.6 : 0));
      this.image.setRotation(rLerp(this.image.rotation -(this.needsFlip ? Math.PI - 0.6 : 0), this.toAngle, 0.6)+(this.needsFlip ? Math.PI - 0.6 : 0));
    else
      this.image.setRotation(
        (this.scene as GameScene).mouseAngle + Math.PI + 0.35
      );

    // console.log(this.image.rotation);

    // if(this.id == (this.scene as GameScene).socket.id) {
     if (this.image.rotation - (this.id != (this.scene as GameScene).socket.id && this.needsFlip ? Math.PI -0.6 : 0 ) > Math.PI / 2 || this.image.rotation -  (this.id != (this.scene as GameScene).socket.id && this.needsFlip ? Math.PI -0.6 : 0 ) < -Math.PI / 2) {
      this.image.scaleX = -1 * this.realScaleX;
     if(this.id == (this.scene as GameScene).socket.id) { 
      // console.log(this.image.rotation);
      this.image.rotation += Math.PI - 0.6 
    };
    this.needsFlip = true;
    // console.log("flip");
    } else {
      this.image.scaleX = 1 * this.realScaleX;
      this.needsFlip = false;

    }
  // }
    

    //  this.gun.setRotation(this.square.rotation);
    //  this.gun.x = Math.cos(this.square.rotation) * this.bodySize/2;
    //  this.gun.y = Math.sin(this.square.rotation) * this.bodySize/2;

    this.healthBar.updateContainer();

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
