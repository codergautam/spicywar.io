import Phaser from "phaser";

class OpenScene extends Phaser.Scene {
    callback: any;
    e: boolean;
    background: Phaser.GameObjects.Rectangle;
    loadText: Phaser.GameObjects.Text;
    canvas: any;
    mobile: boolean;
  progressText: Phaser.GameObjects.Text;
    localStorageAvailable: boolean;
    constructor() {
      super("open");
    }
    preload() {
      console.time("load");
        this.e = true;
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x2e74e6).setOrigin(0).setScrollFactor(0, 0).setScale(2);
   this.loadText =  this.add.text(0,0,"Loading").setOrigin(0.5,0.5);
   this.progressText = this.add.text(0,0,"please wait.").setOrigin(0.5,0.5);
      
      this.loadText.setFontSize(this.canvas.width/20);
      this.progressText.setFontSize(this.canvas.width/40);
      this.loadText.x = this.canvas.width/2;
      this.loadText.y = this.canvas.height/2;
      this.progressText.x = this.canvas.width/2;
      this.progressText.y = this.canvas.height/2 + this.canvas.height/10;
      this.load.on("fileprogress", function(file, progress){
        // var key = file.key;
        var loader = this.load;
var total = loader.totalToLoad;
var remainder = loader.list.size + loader.inflight.size;
var progress = (1 - (remainder / total) as any);
        this.progressText.setText((progress*100).toFixed(1)+"%");
    }, this);

      //load images

      this.load.image("title", "/assets/images/title.png");
      
      this.load.html("namebox", "/assets/html/name.html");
      // this.load.image("dragon", "/assets/images/dragon.png");

      // this.load.image("redPlayer", "/assets/images/redPlayer.png");
      // this.load.image("bluePlayer", "/assets/images/bluePlayer.png");
      
      this.load.image("background", "/assets/images/background.jpeg");
      this.load.image("bridge", "/assets/images/bridge.png");

      this.load.image("blueDragon", "/assets/images/bluedragon.png");
      this.load.image("redDragon", "/assets/images/reddragon.png");

      this.load.image("blueWinged", "/assets/images/blueWinged.png");
      this.load.image("redWinged", "/assets/images/redWinged.png");

      //introbutton
      this.load.image("introButton", "/assets/images/intro.png");
      
      this.load.image("home", "/assets/images/home.png");
      this.load.image("again", "/assets/images/again.jpeg");
      
      this.load.image("redPepper", "/assets/images/redPepper.png");
      this.load.image("bluePepper", "/assets/images/bluePepper.png");
      
      this.load.image("grass", "/assets/images/circlegrass.png");
      this.load.audio("titleMusic", "/assets/audio/title.mp3");
      this.load.audio("pick", "/assets/audio/pick.wav");

      // this.load.video("intro", "/assets/videos/intro.mp4", 'canplaythrough', false, true);

      this.load.image("redFlag", "/assets/images/redFlag.png");
      this.load.image("blueFlag", "/assets/images/blueFlag.png");

      this.load.image("blueFireball", "/assets/images/blueFireball.png");
      this.load.image("redFireball", "/assets/images/redFireball.png");

      this.load.audio("dead", "/assets/audio/dead.wav");
      this.load.audio("killedSomeone", "/assets/audio/killedSomeone.wav");
      this.load.audio("water", "/assets/audio/water.wav");
      this.load.audio("fellwater", "/assets/audio/fellwater.wav");
      this.load.audio("gothit", "/assets/audio/gothit.wav");
      this.load.audio("hitsomeone", "/assets/audio/hitsomeone.wav");
      this.load.audio("shoot", "/assets/audio/shoot.mp3");

      this.load.image("skip", "/assets/images/skip.png");

      this.load.audio("captured", "/assets/audio/captured.wav");

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