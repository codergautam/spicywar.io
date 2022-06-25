import Phaser from "phaser";

export default class GameMap extends Phaser.GameObjects.Container {
  islands: Phaser.GameObjects.Rectangle[];
  constructor(scene: Phaser.Scene) {
    super(scene);
   
    this.scene.add.existing(this);
  }
  end() {
    
  }
  updateObject() {

  }
}