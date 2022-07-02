import Phaser from "phaser";
import GameScene from "../GameScene";
import { PlayerData } from "../helpers/Packets";
import HealthBar from "./HealthBar";

export default class Player extends Phaser.GameObjects.Container {
  gun: Phaser.GameObjects.Rectangle;
  square: Phaser.GameObjects.Rectangle;
  bodySize: number;
  lastTick: number;
  toAngle: number;
  lastUpdate: number;
  id: string;
  name: string;
  speed: number;
  team: string;
  
  healthBar: HealthBar;
  nameTag: Phaser.GameObjects.Text;
  image: Phaser.GameObjects.Image;

  oldPeppers: number;
  needsFlip: boolean;
  realScaleX: number;
  oldLevel: number;
  oldUntilNextLevel: number[];
  circle: Phaser.GameObjects.Ellipse;
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

    const convert = (num, val, newNum) => (newNum * val) / num

    this.realScaleX = convert(100, 0.5, this.bodySize);
    this.image.setScale(this.realScaleX);

    this.circle = new Phaser.GameObjects.Ellipse(this.scene, 0, 0, this.bodySize, this.bodySize, team == "red" ? 0xFF0000 : 0x0000FF).setDepth(4958).setOrigin(0.5);
    // this.add(this.circle);
    (this.scene as GameScene).uiCam.ignore(this.circle);
    (this.scene as GameScene).cameras.main.ignore(this.circle);


    // this.image.;
    this.nameTag = new Phaser.GameObjects.Text(
      scene,
      0,
      0,
      name,
      {
        fontSize: "20px",
        color: team == "red" ? "#ff0000" : "#00FFFF",
        align: "center",
      }
    )
      .setDepth(5)
      .setOrigin(0.5);



    // if (this.id == (this.scene as GameScene).socket.id)
      this.healthBar = new HealthBar(
        scene,
        0,
       0,
        75,
        10,
        false,
        true
      ).setDepth(99);
      this.healthBar.bar.x = -this.healthBar.width / 2;

    this.healthBar.setHealth(100);

    this.toAngle = 0;

    // this.add(this.square);
    // this.add(this.gun);
    this.add(this.image);
    this.add(this.healthBar);
    this.add(this.circle)
    if (this.id != (this.scene as GameScene).socket.id) this.add(this.nameTag);
    this.scene.add.existing(this);
    (this.scene as GameScene).uiCam.ignore(this);
    (this.scene as GameScene).minimap.ignore([this.healthBar, this.nameTag, this.image]);

  }
  tick(data: PlayerData, hit: boolean) {
    this.toAngle = data.lookAngle + Math.PI + 0.35;
    // if(this.needsFlip) this.toAngle -= Math.PI - 0.6;
    this.lastTick = Date.now();

 

    if(data.canFly) {
      this.image.setTexture(this.team+"Winged");
    }

    const convert = (num, val, newNum) => (newNum * val) / num
    // console.log(convert(100, 40, this.bodySize));
    this.nameTag.setFontSize(convert(100, 40, data.bodySize));
    this.healthBar.bar.setScale(convert(100, 1, data.bodySize));
    // this.healthBar.setScale(convert(100, 1, data.bodySize));

    this.healthBar.bar.x = -this.healthBar.width / 2;
    this.healthBar.bar.x -= this.healthBar.bar.scale == 1 ? 0 : this.healthBar.bar.scale == 1.5 ? 15 : 30;
    // this.healthBar

    // this.nameTag.x = 0
    
    
    this.realScaleX = convert(100, 0.5, data.bodySize);
    // console.log(data.bodySize);

    if(this.realScaleX != this.image.scaleX) {
      this.image.setScale(this.realScaleX);
      this.circle.displayHeight = data.bodySize;
      this.circle.displayWidth = data.bodySize;
      this.circle.setFillStyle(this.id == (this.scene as GameScene).socket.id ? 0xFFFF00 : this.team == "red" ? 0xFF0000 : 0x0000FF);
      this.healthBar.y = 0;
      this.healthBar.bar.y = -1.1 * (this.image.displayHeight / 2);
      this.nameTag.y = -1.3 * (this.image.displayHeight / 2);
    } 

    this.healthBar.maxValue = data.maxHealth;


    // this means we just got some data about this player
    this.scene.tweens.add({
      targets: this,
      x: data.pos.x,
      y: data.pos.y,
      duration: hit ? 300 : 200,
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
      if((data.peppers - sum)/(data.untilNextLevel - sum) > 1 && data.level == 10) {
        (this.scene as GameScene).spiceText.setText("🌶️ FULLY SPICED UP 🌶️");
        if(!(this.scene as GameScene).shownFly) {
          (this.scene as GameScene).shownFly = true;
          (this.scene as GameScene).levelQueue.push("Flying activated!!! 🚀");
          this.image.setTexture(this.team+"Winged");
        }

      } else (this.scene as GameScene).spiceText.setText("🌶️  Spice Level: "+data.level+" ("+Math.round((data.peppers - sum)/(data.untilNextLevel - sum)*100)+"%)");

      (this.scene as GameScene).spicyMeter.setLerpValue((data.peppers - sum)/(data.untilNextLevel - sum)*100);
      this.oldLevel = data.level;
    }

    if(this.id == (this.scene as GameScene).socket.id) {

      if(data.peppers >= 0) {
    (this.scene as GameScene).killCount.setText("[img=pepper] " + data.peppers ?? 0);
      }

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
