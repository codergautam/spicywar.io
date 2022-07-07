import GameScene from "../GameScene";

export default class Pepper extends Phaser.GameObjects.Container {
  id: string;
  image: Phaser.GameObjects.Image;
  constructor(scene: GameScene, x: number, y: number, id: string, color: string) {
    super(scene);

    this.x = x;
    this.y = y;
    this.id = id;

    this.image = new Phaser.GameObjects.Image(scene, 0, 0, color+"Pepper").setScale(0.2).setAlpha(0);
    this.scene.tweens.add({
      targets: this.image,
      alpha: 1,
      duration: 1000,
      ease: "Linear",
      repeat: 0,
      yoyo: false
    });
    this.add(this.image);
    this.scene.add.existing(this);
    scene.uiCam.ignore(this);
    // scene.minimap.ignore(this);
  }
} 