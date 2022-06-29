import Phaser from "phaser";
import GameScene from "../GameScene";
export default class ImgButton extends Phaser.GameObjects.Container {
    btn: any;
    constructor(scene: Phaser.Scene, x: number, y: number, key: any, onClick: any) {
        super(scene);

        this.scene = scene;
        this.x = x;
        this.y = y;

        this.btn = new Phaser.GameObjects.Image(scene, 0, 0, key);
      (this.scene as GameScene).cameras.main.ignore(this);
      (this.scene as GameScene).minimap.ignore(this);
        this.btn.setInteractive().on("pointerdown", onClick);
        this.add(this.btn);
    }
}