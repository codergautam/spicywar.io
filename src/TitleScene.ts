import Phaser from "phaser";
import ImgButton from "./components/PhaserImgButton";

class TitleScene extends Phaser.Scene {
  callback: Function;
  nameBox: Phaser.GameObjects.DOMElement;
  canvas: { width: number, height: number };
  background: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  mobile: boolean;
  rect: Phaser.GameObjects.Rectangle;
  enterKey: Phaser.Input.Keyboard.Key;
  titleMusic: Phaser.Sound.BaseSound;
  introButton: ImgButton;
    localStorageAvailable: boolean;
  constructor(callback: Function) {
    super("title");
    this.callback = callback;
  }
  preload() {
  }
  create() {
    this.titleMusic = this.sound.add("titleMusic", {
      volume: 0.5,
      loop: true
    });
    this.titleMusic.play();
    this.rect = this.add.rectangle(0,0,0,0, 0xffffe0).setOrigin(0.5).setScale(2).setDepth(10);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
    this.nameBox = this.add.dom(0,0).createFromCache("namebox").setScale(0);
    

    if(this.localStorageAvailable && window.localStorage.getItem("name") !== null) {
      (this.nameBox.getChildByName('name') as any).value = window.localStorage.getItem("name");
    }

    this.background = this.add.image(0, 0, "title").setOrigin(0).setScrollFactor(0, 0).setScale(2).setDepth(0).setAlpha(0);

    this.tweens.add({
      targets: this.background,
      alpha: 1,
      duration: 500,
      ease: "Linear",
      repeat: 0,
      yoyo: false
    });


    this.text = this.add.text(0, 0, "Spicywar.io", {
      fontSize: "64px",
      color: "#000000",
      fontFamily: "Finlandica, Arial",
    }).setOrigin(0.5).setDepth(15).setScrollFactor(0, 0).setScale(0);

    this.introButton = new ImgButton(this, 0, 0, "introButton", () => {
     if(this.localStorageAvailable) window.localStorage.setItem("story", "false");
      click();
    });
    this.introButton.btn.setScale(this.canvas.width / 3000);
    this.introButton.btn.x += this.introButton.btn.displayWidth/2;
    this.introButton.btn.y += this.introButton.btn.displayHeight/2;
    


    this.tweens.add({
      targets: [this.text, this.nameBox],
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: "Linear",
      repeat: 0,
      yoyo: false
    });

const click = () => {
  var box = this.nameBox.getChildByName("name") as HTMLInputElement | null;
  var name = box.value.trim();
  if(!name || name.length == 0) return;

  this.nameBox.destroy();
  this.text.destroy();
  this.rect.destroy();
  

 if(this.localStorageAvailable) window.localStorage.setItem("name", name);


  this.callback(name, this.titleMusic);
}

this.enterKey.on("down", click);

    this.nameBox.getChildByName("btn").addEventListener("click", () => {
      click();
    });


    //this.stats.y -= this.stats.height

    const resize = () => { 

      // this.game.scale.resize(this.canvas.width, this.canvas.height);

      try {
        const cameraWidth = this.cameras.main.width;
        const cameraHeight = this.cameras.main.height;
        this.background.setScale(Math.max(cameraWidth / this.background.width, cameraHeight / this.background.height));

        this.background.x = 0 - ((this.background.displayWidth - cameraWidth) / 2);
      } catch (e) {

      }

      // check if tween is running
      // if(this.tweens.isTweening(this.text)) {
      this.text.y = this.canvas.height / 3;
      
      this.text.x = this.canvas.width / 2;
      

      this.nameBox.x = this.canvas.width / 2;
      this.nameBox.y = this.canvas.height / 2.2;
    };
    var doit: string | number | NodeJS.Timeout;

    window.addEventListener("resize", function() {
      clearTimeout(doit);
      doit = setTimeout(resize, 100);
    });

    resize();
  }
  update(time: number, delta: number): void {
       this.text.setFontSize(this.nameBox.getChildByName('name').clientWidth / 5);

       this.rect.setPosition(this.canvas.width/2, this.text.y - this.text.displayHeight);
        this.rect.setSize(this.text.displayWidth /1.5,  (this.canvas.height / 2.2) - this.rect.y);
        this.rect.x -= this.rect.displayWidth/2;

        this.introButton.btn.x = 0;
        this.introButton.btn.y = 0;

        this.introButton.btn.setScale(this.canvas.width / 3000);
        this.introButton.btn.x += this.introButton.btn.displayWidth/2;
        this.introButton.btn.y += this.introButton.btn.displayHeight/2;

  }
}

export default TitleScene;
