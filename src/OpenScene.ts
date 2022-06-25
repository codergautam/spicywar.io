import Phaser from "phaser";

class OpenScene extends Phaser.Scene {
    callback: any;
    e: boolean;
    background: Phaser.GameObjects.Rectangle;
    loadText: Phaser.GameObjects.Text;
    canvas: any;
    mobile: boolean;
    constructor() {
      super("open");
    }
    preload() {
      console.time("load");
        this.e = true;
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x2e74e6).setOrigin(0).setScrollFactor(0, 0).setScale(2);
   this.loadText =  this.add.text(0,0,"Loading").setOrigin(0.5,0.5);
      
      this.loadText.setFontSize(this.canvas.width/20);
      this.loadText.x = this.canvas.width/2;
      this.loadText.y = this.canvas.height/2;

      //load images

      this.load.image("title", "/assets/images/bg.jpeg");
      
      this.load.html("namebox", "/assets/html/name.html");

        this.scale.fullscreenTarget = document.getElementById("game");
        console.timeEnd("load");
  
    }

    create() {
    
             this.scene.stop();
             this.scene.start("title");
    }
    update() {
    
    }
}

export default OpenScene;