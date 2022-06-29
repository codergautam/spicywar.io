import Phaser from "phaser";
class HealthBar extends Phaser.GameObjects.Container {
    preset: string | boolean;
    bar: Phaser.GameObjects.Graphics;
    maxValue: number;
    value: number;
    value2: number;
    toLerp: number;
    pointFix: boolean;

    constructor (game: Phaser.Scene, x: number, y: number, width: number, height: number, preset: string | boolean=false, pointFix: boolean=false)
    {
      

        super(game);

        this.preset = preset;
        this.bar = new Phaser.GameObjects.Graphics(game).setDepth(99);
  
        this.x = x;
        this.y = y;
        this.pointFix = pointFix;

        this.maxValue = 100;
        this.value = 0;
        this.value2 = 0;
        this.toLerp = 0;
        this.height = height;
        this.width = width;

        this.draw();
  
        this.add(this.bar);
        game.add.existing(this);
    }
  
    setHealth (amount: number, amount2: number=0)
    {
  
        const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
        this.value = clamp(amount, 0, this.maxValue);
        this.value2 = clamp(amount2, 0, this.maxValue);
  
        this.draw();
  
        return (this.value === 0);
    }
    setLerpValue(value: any) {
        this.toLerp = value;
    }
    draw ()
    {
        this.bar.clear();
  
        //  BG
        this.bar.fillStyle(0x000000);

        if(!this.pointFix) this.bar.fillRect(this.x, this.y, this.width, this.height);
        else this.bar.fillRect(0, 0, this.width, this.height);
        //  Health
  
        this.bar.fillStyle(0xffffff);
        if(!this.pointFix) this.bar.fillRect(this.x + 2, this.y + 2, this.width-4, this.height-4);
        else this.bar.fillRect(2, 2, this.width-4, this.height-4);
  
        if(!this.preset) {
        if (this.value/this.maxValue < 0.30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else if(this.value/this.maxValue  < 0.5) {
           this.bar.fillStyle(0xFFFF00); 
        } else
        {
            this.bar.fillStyle(0x00ff00);
        }
    } else {

        this.bar.fillStyle(0xFF0000);
    }

        var d1 = Math.floor((this.width-4) * (this.value/this.maxValue));
  
       if(!this.pointFix) this.bar.fillRect(this.x + 2, this.y + 2, d1, this.height-4);
         else this.bar.fillRect(2, 2, d1, this.height-4);

        if(this.preset == "domination") {

            this.bar.fillStyle(0x0000ff);

            var d = Math.floor((this.width-4) * (this.value2/this.maxValue));

          if(!this.pointFix)  this.bar.fillRect(this.x + 2 + d1, this.y + 2, d, this.height-4);
            else this.bar.fillRect(2 + d1, 2, d, this.height-4);
            
        }
    }

    updateContainer() {
        const lerp = (start: number,end: number,amt: number) => (1-amt)*start+amt*end;

        if(isNaN(this.value)) this.value = 0; 

        this.setHealth(lerp(this.value, this.toLerp, 0.25));
       
    }
  
  }
  

  export default HealthBar;