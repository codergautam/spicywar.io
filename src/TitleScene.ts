import Phaser from "phaser";

class TitleScene extends Phaser.Scene {
  callback: Function;
  nameBox: Phaser.GameObjects.DOMElement;
  canvas: { width: number, height: number };
  background: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  mobile: boolean;
  constructor(callback: Function) {
    super("title");
    this.callback = callback;
  }
  preload() {
  }
  create() {
    this.nameBox = this.add.dom(0,0).createFromCache("namebox");
    this.background = this.add.image(0, 0, "title").setOrigin(0).setScrollFactor(0, 0).setScale(2);

    this.text = this.add.text(this.canvas.width / 2, 0, "Waterwar.io", {
      fontSize: "64px",
      color: "#000000",
    }).setOrigin(0.5);

    this.nameBox.getChildByName("btn").addEventListener("click", () => {
      var box = this.nameBox.getChildByName("name") as HTMLInputElement | null;
      var name = box.value.trim();
      if(!name || name.length == 0) return;

      this.callback(name);
    });


    //this.stats.y -= this.stats.height

    const resize = () => { 

      this.game.scale.resize(this.canvas.width, this.canvas.height);

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
      this.text.setFontSize(Math.min(this.canvas.width/12, this.canvas.height/5));
  }
}

export default TitleScene;
