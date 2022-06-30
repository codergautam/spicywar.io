import Phaser from "phaser";

class TitleScene extends Phaser.Scene {
  callback: Function;
  nameBox: Phaser.GameObjects.DOMElement;
  canvas: { width: number, height: number };
  background: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  mobile: boolean;
  rect: Phaser.GameObjects.Rectangle;
  constructor(callback: Function) {
    super("title");
    this.callback = callback;
  }
  preload() {
  }
  create() {
    this.rect = this.add.rectangle(0,0,0,0, 0xB19CB8).setOrigin(0.5).setScale(2).setDepth(10);
    
    this.nameBox = this.add.dom(0,0).createFromCache("namebox");
    this.background = this.add.image(0, 0, "title").setOrigin(0).setScrollFactor(0, 0).setScale(2).setDepth(0);

    this.text = this.add.text(this.canvas.width / 2, 0, "Spicywar.io", {
      fontSize: "64px",
      color: "#000000",
    }).setOrigin(0.5).setDepth(15).setScrollFactor(0, 0);


    this.nameBox.getChildByName("btn").addEventListener("click", () => {
      var box = this.nameBox.getChildByName("name") as HTMLInputElement | null;
      var name = box.value.trim();
      if(!name || name.length == 0) return;

      this.nameBox.destroy();
      this.text.destroy();
      this.rect.destroy();
      

      this.callback(name);
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
      this.text.x = this.canvas.width / 2;
      this.text.y = this.canvas.height / 4;

      this.nameBox.x = this.canvas.width / 2;
      this.nameBox.y = this.canvas.height / 2.3;
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
        this.rect.setSize(this.text.displayWidth /1.5,  (this.canvas.height / 2.3) - this.rect.y);
        this.rect.x -= this.rect.displayWidth/2;
  }
}

export default TitleScene;
