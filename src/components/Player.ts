import Phaser from "phaser";
import GameScene from "../GameScene";
import { PlayerData } from "../helpers/Packets";
import HealthBar from "./HealthBar";

const TIME_TRAVEL_MS = 100;
const FRAME_HISTORY_MAX = 5;

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
  history: {frame: PlayerData, timestamp: number}[];
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

    this.history = [];

    this.id = id;
    this.name = name;
    this.speed = speed;

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

    // this.image.;
    this.nameTag = new Phaser.GameObjects.Text(
      scene,
      0,
      -1 * this.image.displayHeight,
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
        -0.5 * this.image.displayHeight,
        75,
        10,
        false
      ).setDepth(99);
    else
      this.healthBar = new HealthBar(
        scene,
        0,
        -0.75 * this.image.displayHeight,
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
  getPreviousTimestampFrame(time) {
    for (let i = this.history.length - 1; i >= 0; i -= 1) {
      const timestampFrame = this.history[i];
      if (timestampFrame.timestamp < time) {
        return timestampFrame;
      }
    }
    return null;
  }
  getNextTimestampFrame(time) {
    let nextTimestampFrame = null;
    for (let i = this.history.length - 1; i >= 0; i -= 1) {
      const timestampFrame = this.history[i];
      if (timestampFrame.timestamp < time) {
        break;
      }
      nextTimestampFrame = timestampFrame;
    }
    return nextTimestampFrame;
  }

  tick(data: PlayerData, hit: boolean) {
    this.toAngle = 0;

    // this means we just got some data about this player

    this.history.push({frame: data, timestamp: this.scene.time.now});
    if (this.history.length > FRAME_HISTORY_MAX) this.history.shift();

    (this.scene as GameScene).killCount.setText("[img=pepper] " + data.peppers);
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
      this.image.setRotation(rLerp(this.image.rotation, this.toAngle, 0.5));
    else
      this.image.setRotation(
        (this.scene as GameScene).mouseAngle + Math.PI + 0.35
      );

    console.log(this.image.rotation);

    const previousTimestampFrame = this.getPreviousTimestampFrame(
      this.scene.time.now - TIME_TRAVEL_MS
    );
    const nextTimestampFrame = this.getNextTimestampFrame(
      this.scene.time.now - TIME_TRAVEL_MS
    );

    var time = this.scene.time.now;

    var interpPosition;
    if (previousTimestampFrame && nextTimestampFrame) {
      let interpFactor = (time - TIME_TRAVEL_MS - previousTimestampFrame.timestamp)
      / (nextTimestampFrame.timestamp - previousTimestampFrame.timestamp);
      // Just spawned in, don't interpolate anything.
      interpPosition = new Phaser.Math.Vector2(
        previousTimestampFrame.frame.pos.x,
        previousTimestampFrame.frame.pos.y,
      ).lerp(new Phaser.Math.Vector2(
        nextTimestampFrame.frame.pos.x,
        nextTimestampFrame.frame.pos.y,
      ), interpFactor);
    } else if(this.history.length > 0) {
      const lastTimestampFrame = this.history[this.history.length - 1];
      interpPosition = new Phaser.Math.Vector2(
        lastTimestampFrame.frame.pos.x,
        lastTimestampFrame.frame.pos.y,
      );
    }

    if(interpPosition) this.setPosition(interpPosition.x, interpPosition.y);

    //  if (this.image.rotation > Math.PI / 2 || this.image.rotation < -Math.PI / 2) {
    //   this.image.scaleX = -1;
    //   this.image.rotation += Math.PI - 0.3;
    // } else {
    //   this.image.scaleX = 1;
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
