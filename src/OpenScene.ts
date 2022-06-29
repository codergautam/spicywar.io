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
      this.load.image("dragon", "/assets/images/dragon.png");

      // this.load.image("redPlayer", "/assets/images/redPlayer.png");
      // this.load.image("bluePlayer", "/assets/images/bluePlayer.png");
      
      this.load.image("background", "/assets/images/background.jpeg");
      this.load.image("bridge", "/assets/images/bridge.png");

      this.load.image("blueDragon", "/assets/images/bluedragon.png");
      this.load.image("redDragon", "/assets/images/reddragon.png");
      
      this.load.image("home", "/assets/images/home.png");
      this.load.image("again", "/assets/images/again.jpeg");
      this.load.image("pepper", "/assets/images/pepper.png");

      // this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);



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