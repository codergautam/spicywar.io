import Phaser from "phaser";
import BBCodeText from "phaser3-rex-plugins/plugins/bbcodetext";
import { io, Socket } from "socket.io-client";
import Bullet from "./components/Bullet";
import DeathScreen from "./components/DeathScreen";
import HealthBar from "./components/HealthBar";
import Island from "./components/Island";
import Leaderboard from "./components/Leaderboard";
import GameMap from "./components/Map";
import Player from "./components/Player";
import TeamPicker from "./components/TeamPicker";
import { Data, PlayerData, FirstPlayerData, BulletData, IslandData, BridgeData } from "./helpers/Packets";

interface Keys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;

  w: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
}


class GameScene extends Phaser.Scene {
  mobile: boolean;
  canvas: { width: number, height: number };
  name: string;
  socket: Socket;
  loadingText: Phaser.GameObjects.Text;
  ready: boolean;
  players: Map<string, Player>;
  bullets: Map<string, Bullet>
  mouseAngle: number;
  map: GameMap;
  fpsCounter: Phaser.GameObjects.Text;
  controller: {left: boolean, right: boolean, up: boolean, down: boolean};
  islands: Island[];
  uiCam: Phaser.Cameras.Scene2D.Camera;
  teamPicker: TeamPicker;
  deathScreen: DeathScreen;
  callback: Function;
  dominationBar: HealthBar;
  killCount: any;
  dominationText: Phaser.GameObjects.Text;
  team: string;
  cirle: Phaser.GameObjects.Arc;
  spicyMeter: HealthBar;
  spiceText: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.TileSprite;
  lastKnownMyDisplayWidth: number;
  minimap: Phaser.Cameras.Scene2D.Camera;
  leaderboard: any;
  gamePoint: {x: number, y: number};
  captureText: Phaser.GameObjects.Text;

    constructor(callback: Function) {
      super("game");

      this.callback = callback;
    
    }
    preload() {

      this.ready = false;
      this.players = new Map();
      this.bullets = new Map();
      this.islands = [];
    }

    create() {



      // this.deathScreen = new DeathScreen(this);

this.lastKnownMyDisplayWidth = 0;
      this.uiCam = this.cameras.add(0, 0, this.canvas.width, this.canvas.height);

      this.teamPicker = new TeamPicker(this);
      this.cameras.main.ignore(this.teamPicker);


      // this.minimap.ignore(this.teamPicker);

      var team = "red";
      this.team = "none";

      this.teamPicker.rect1.rect.on("pointerdown", () => {
        team = "red";
        this.teamPicker.visible = false;
        start();
      });
      this.teamPicker.rect2.rect.on("pointerdown", () => {
        team = "blue";
        this.teamPicker.visible = false;
        start();

      });

      

       var start = () => {
        this.loadingText = this.add.text(
          this.canvas.width / 2,
          this.canvas.height / 2,
          "Connecting...",
        ).setOrigin(0.5);
      this.socket = io();
      this.socket.emit("go", this.name, team); 
      this.team = `${team}`;

      this.background = this.add.tileSprite(0, 0, this.canvas.width*1.1, this.canvas.height*1.1, "background");
      this.uiCam.ignore(this.background);

      this.minimap = this.cameras.add(200, 10, 100, 100).setZoom(0.05).setName('mini');
      this.minimap.width = this.canvas.width/ 5;
      this.minimap.height = this.canvas.width/ 5;
      this.minimap.y = this.canvas.height - this.minimap.height - 10;
      this.minimap.x = this.canvas.width - this.minimap.width - 10;
      var mapSize = 4000
      //calculate zoom
      var zoom = this.minimap.width / mapSize;
      this.minimap.setZoom(zoom);
      // this.minimap.setBackgroundColor(0x002244);
      this.minimap.setBackgroundColor(this.team == "blue" ? 0x002244 : 0x440000);
      this.minimap.scrollX = -150;
      this.minimap.scrollY = -150;

      this.minimap.ignore(this.background);

      this.captureText = this.add.text(this.canvas.width / 2, this.canvas.height / 5, "", {
        fontSize: Math.min(this.canvas.width/10, 70)+"px",
        fontFamily: "Arial",
        color: "#000000",
        align: "center"
      }).setDepth(10);
      this.captureText.setOrigin(0.5);
      this.cameras.main.ignore(this.captureText);
      this.minimap.ignore(this.captureText);


      this.killCount = new BBCodeText(this, 15, 10, "Stabs: 0", {
        fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif",
        fill: "#000000",
      }).setFontSize(40).setDepth(101);
      this.add.existing(this.killCount);
      this.killCount.addImage("pepper", {
        key: "pepper",
        width: 45,
        height: 45
      });
      this.killCount.setText("[img=pepper] 0");
      this.killCount.setScrollFactor(0);



      this.cameras.main.ignore(this.killCount);
      this.minimap.ignore(this.killCount);
      

      this.map = new GameMap(this);
      this.leaderboard = new Leaderboard(this);
      this.dominationText = this.add.text(
        this.canvas.width / 2,
        this.canvas.height /100,
        "",
        {
          color: "#000000",
        }
      ).setOrigin(0.5, 0).setFontSize(this.canvas.width / 30).setDepth(101);

      this.dominationBar = new HealthBar(this, this.canvas.width / 4, this.canvas.height /25, this.canvas.width / 2, this.canvas.height / 20, "domination" ).setDepth(10);
      this.dominationBar.draw();


  

      this.spicyMeter = new HealthBar(this, this.canvas.width / 4, this.canvas.height - this.canvas.height / 15, this.canvas.width / 2, this.canvas.height / 20, "spicy", true ).setDepth(10);
      this.spicyMeter.draw();


      this.spiceText = this.add.text(
        this.canvas.width / 2,
        this.spicyMeter.y,
        "🌶️ Spice Level: 1 (0%)",
        {
          color: "#000000",
        }
      ).setOrigin(0.5, 0).setFontSize(this.canvas.width / 30).setDepth(101);

      this.spiceText.y -= this.spiceText.displayHeight;


      this.cameras.main.ignore(this.spiceText);
      this.cameras.main.ignore(this.spicyMeter);
      this.cameras.main.ignore(this.dominationBar);
      this.cameras.main.ignore(this.dominationText);
      this.minimap.ignore([this.spiceText, this.spicyMeter, this.dominationBar, this.dominationText]);
      this.dominationBar.bar.x -= this.dominationBar.width / 2;

     const playerJoined = (data: FirstPlayerData) =>{
        this.players.set(data.id, new Player(this, data.pos.x, data.pos.y, data.id, data.name, data.team).setDepth(2));
        if(this.socket.id === data.id) {
         this.cameras.main.startFollow(this.players.get(data.id));
        //  this.minimap.startFollow(this.players.get(data.id));
              }
        }

      this.socket.on("playerJoined", (data: FirstPlayerData) => {
        // console.log("playerJoined", data);
        playerJoined(data);
      });
      this.socket.on("islandUpdate", (data: IslandData) => {
        if(this.islands.find(i => i.id === data.id)) {
          var island = this.islands.find(i => i.id === data.id);
          island.setTeam(data.capturedBy);
          island.setPercent(data.capturedPercentage, data.capturingBy);
          // console.log(data);

          if(data.people.includes(this.socket.id) && this.team && data.capturedBy == "none") {
           if(Math.ceil(data.capturedPercentage) < 100) {
            this.captureText.setData('island', data.id);
            if(data.capturingBy == this.team) this.captureText.setText("Capturing..." + Math.round(data.capturedPercentage) + "%");
            else this.captureText.setText("Destroying..." + Math.round(data.capturedPercentage) + "%");
           }
           else {
            this.captureText.setText("");
            var t = this.add.text(this.canvas.width / 2, this.canvas.height / 5, "Island Captured!", {
              fontSize: Math.min(this.canvas.width/10, 70)+"px",
              fontFamily: "Arial",
              color: "#000000",
              align: "center"
            }).setDepth(10).setAlpha(0);
            t.setOrigin(0.5);
            this.cameras.main.ignore(t);
            this.minimap.ignore(t);
            this.tweens.add({
              targets: t,
              alpha: 1,
              onComplete: () => {
                this.tweens.add({
                  targets: t,
                  alpha: 0,
                  duration: 1000,
                  onComplete: () => {
                    t.destroy();
                  }
                });
              }
            });
           }
          } else {
            // console.log(this.captureText.data)
            if(this.captureText.getData('island') == data.id) this.captureText.setText("");
          }
          

        }
      })
      this.socket.on("playerLeft", (id: string) => {
        if(this.players.has(id)){
          if(this.players.get(id)) {
          this.players.get(id).destroy();
          this.players.delete(id);
          }
        }
      });
      this.socket.on("players", (data: FirstPlayerData[]) => {
        this.ready = true;
        this.loadingText.destroy();

        for (const player of data) {
          if(!this.players.has(player.id)) playerJoined(player);
          else this.players.get(player.id).tick(player, false);
      }
      });
      this.socket.on("addBullet", (data: BulletData) => {
        if(!this.bullets.has(data.id)) this.bullets.set(data.id, new Bullet(this, data).setDepth(1));
      });
      this.socket.on("removeBullet", (id: string) => {
        if(this.bullets.has(id)) {
          setTimeout(() => {
            if(this.bullets.get(id)) {
          this.bullets.get(id).destroy();
          this.bullets.delete(id);
            }
          }, (1000/20)*2);
        }
      });
      this.socket.on("bullets", (data: BulletData[]) => {
        for (const bullet of data) {
          if(!this.bullets.has(bullet.id)) this.bullets.set(bullet.id, new Bullet(this, bullet).setDepth(1));
        }

        for (const bullet of this.bullets.values()) {
          if(!data.find(b => b.id === bullet.id)) {
            setTimeout(() => {
              if(bullet) {
              bullet.destroy();
              this.bullets.delete(bullet.id);
              }
            }, (1000/20)*2);
          }
        }
      });
      this.socket.on("islands", (data: IslandData[]) => {
        // console.log("islands", data);
        this.islands = data.map(d => new Island(this, d).setDepth(1));
      });

      this.socket.on("bridges", (data: BridgeData[]) => {
        data.forEach(d => {
          //  var r = this.add.rectangle(d.pos.x, d.pos.y, d.width*2, d.length, 0xffffff).setDepth(0).setRotation(d.angle).setOrigin(0,0);
          var r = this.add.tileSprite(d.pos.x, d.pos.y, d.width*2, d.length, "bridge").setDepth(0).setTileScale(0.4).setRotation(d.angle).setOrigin(0,0);
           this.uiCam.ignore(r);
        });
      });
      // this.socket.on("islandCaptured", (id: number, team: string) => {
      //   // console.log("islandCaptured", id, team);
      //   this.islands.find(i => i.id === id).setTeam(team);
        
      // });
      // this.socket.on("islandCapturing", (id: number, team: string, percent: number) => {
      //   // console.log("islandCapturing", id, team, percent);
      //   this.islands.find(i => i.id === id).setPercent(percent, team);

      // })
      // this.socket.on("corners", (data: {x: number, y: number}[]) => {
      //   data.forEach(d => {
      //     var el = this.add.ellipse(d.x, d.y, 5, 5, 0x00ff00).setDepth(10);
      //     setTimeout(() => {
      //       el.destroy();
      //     }, 1000/20);
      //   });
      // });
      this.socket.on("playerUpdate", (data: PlayerData) => {
        if(!this.ready) return;
        if(!this.players.has(data.id)) return;
        this.players.get(data.id).tick(data, data.hit);
      });
      // this.socket.on("test", (pos, corners) => {
      //   // console.log(pos);
      //   if(this.cirle) this.cirle.destroy();
      //   this.cirle =  this.add.circle(pos.x, pos.y, 5, 0x00FF0F).setOrigin(0.5).setDepth(10);
       
      // })

      this.socket.on("youDied", ({reason, who, survivedTime, shotDragons, peppers}) => {
       var me = this.players.get(this.socket.id);
       this.killCount.visible = false;
       this.minimap.visible = false;
       this.spiceText.visible = false;
       this.leaderboard.visible = false;
       this.spicyMeter.visible = false;
       this.captureText.setText("");
      //  this.dominationBar.visible = false;
      this.dominationBar.bar.visible = false;
       this.dominationText.visible = false;
       this.tweens.add({
          targets: me,
          alpha: 0,
          
          duration: 500,
          onComplete: () => {
            // console.log("youDied", reason, who, survivedTime, shotDragons, peppers);
            this.deathScreen = new DeathScreen(this, reason, who, survivedTime, shotDragons, peppers);
            me.destroy();

        this.players.delete(this.socket.id);

        
          },
        });     
      });
      this.socket.on("levelUp", (type, level) => {
        //first letter capital
        type = type.charAt(0).toUpperCase() + type.slice(1);
        if(type == "Bullet") type += "s";
        var text= this.add.text(this.canvas.width /2, this.canvas.height / 3, `${type} upgraded!`, {fontSize: "50px", color: "#ffffff"}).setOrigin(0.5).setAlpha(0);
        this.cameras.main.ignore(text);
        this.minimap.ignore(text);
        console.log(type, level);
        this.tweens.add({
          targets: text,
          alpha: 1,
          y: this.canvas.height / 3.5,
          duration: 500,
          onComplete: () => {
            setTimeout(() => {
              this.tweens.add({
                targets: text,
                alpha: 0,
                y: this.canvas.height / 3,
                duration: 500,
                onComplete: () => {
                  text.destroy();
                }
              });
            }, 2000);
          }
        });

      })
      this.socket.on("shotDragon", ({who, id, reason}) => {
        // console.log("shotDragon", who, id, reason);
        var txt = `[b][color=#e82a1f]Shot [/color][color=#0000FF]${who}[/color][/b]`;
        const convert = (num, val, newNum) => (newNum * val) / num;
        var fontsize = convert(1366, 64, this.canvas.width);
					var text = new BBCodeText(this, this.canvas.width/2, this.canvas.height, txt).setOrigin(0.5).setAlpha(0).setFontSize(fontsize);
        this.add.existing(text);

						const completeCallback = (text) => {
							this.tweens.add({
								targets: text,
								alpha: 0,
								y: this.canvas.height,
								onComplete: ()=>{
									text.destroy();
								},
								ease: "Power2",
								duration: 250
							});
						};
            

					this.tweens.add({
						targets: text,
						alpha: 1,
						y: this.canvas.height - this.canvas.height / 6,
						completeDelay: 250,
						duration: 750,
						onComplete: ()=>completeCallback(text),
						ease: "Bounce"
					  });
					this.cameras.main.ignore(text);
          this.minimap.ignore(text);
      });
    //   var keys = (this.input.keyboard.addKeys({
    //     up: 'up',
    //     down: 'down',
    //     left: 'left',
    //     right: 'right',
    //     w: 'W',
    //     s: 'S',
    //     a: 'A',
    //     d: 'D',
    // }) as Keys);  

    this.controller = {
      up: false,
      down: false,
      left: false,
      right: false,
    }

    // keys.up.on('down', () => {
    //   this.controller.up = true;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.down.on('down', () => {
    //   this.controller.down = true;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.left.on('down', () => {
    //   this.controller.left = true;
    //   this.socket.emit("controller", this.controller);
    // }); 
    // keys.right.on('down', () => {
    //   this.controller.right = true;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.w.on('down', () => {
    //   this.controller.up = true;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.s.on('down', () => {
    //   this.controller.down = true;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.a.on('down', () => {
    //   this.controller.left = true;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.d.on('down', () => {
    //   this.controller.right = true;
    //   this.socket.emit("controller", this.controller);
    // });

    // keys.up.on('up', () => {
    //   this.controller.up = false;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.down.on('up', () => {
    //   this.controller.down = false;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.left.on('up', () => {
    //   this.controller.left = false;
    //   this.socket.emit("controller", this.controller);
    // }); 
    // keys.right.on('up', () => {
    //   this.controller.right = false;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.w.on('up', () => {
    //   this.controller.up = false;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.s.on('up', () => {
    //   this.controller.down = false;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.a.on('up', () => {
    //   this.controller.left = false;
    //   this.socket.emit("controller", this.controller);
    // });
    // keys.d.on('up', () => {
    //   this.controller.right = false;
    //   this.socket.emit("controller", this.controller);
    // });

    this.input.on("pointermove", (pointer: PointerEvent) => {
      this.gamePoint = {x: pointer.x, y: pointer.y};
    });
    console.log("gamePoint", this.gamePoint);

    this.mouseAngle =  Math.atan2(this.gamePoint?.y ?? this.game.input.activePointer.y - (this.canvas.height /2), this.gamePoint?.x ?? this.game.input.activePointer.x - (this.canvas.width / 2));
    //on mouse move

    this.input.on("pointerdown", (p: PointerEvent) => {
      console.log("pointerdown");
      this.socket.emit("down", true);
      this.gamePoint = {x: p.x, y: p.y};
    })
    this.input.on("pointerup", (p: PointerEvent) => {
      this.socket.emit("down", false);
      this.gamePoint = {x: p.x, y: p.y};
    });

    setInterval(() => {
      var start = Date.now();
      this.socket.emit( 'ping', function clientCallback() {
         console.log( 'Websocket RTT: ' + (Date.now() - start) + ' ms' );
      });
    }, 2000);

  }
  const resize = () =>{
    // console.log("resize");
    if(this.teamPicker && this.teamPicker.visible) {
      this.teamPicker.resize();
      this.teamPicker.rect1.rect.on("pointerdown", () => {
        team = "red";
        this.teamPicker.visible = false;
        start();
      });
      this.teamPicker.rect2.rect.on("pointerdown", () => {
        team = "blue";
        this.teamPicker.visible = false;
        start();

      });
    }

    this.captureText?.setFontSize(Math.min(this.canvas.width / 10, 70));
    this.captureText?.setX(this.canvas.width / 2 );
    this.captureText?.setY(this.canvas.height / 5 );
if(this.dominationBar && this.dominationBar.visible) {
    this.dominationBar.destroy();
    if(!(this.deathScreen && this.deathScreen.visible)) {
    this.dominationBar = new HealthBar(this, this.canvas.width / 8, this.canvas.height /25, this.canvas.width / 2, this.canvas.height / 20, "domination" ).setDepth(10);

    this.dominationBar.draw();
   }
    this.cameras.main.ignore(this.dominationBar);
    this.minimap.ignore(this.dominationBar);

    this.dominationText.x = this.canvas.width / 2;
    this.dominationText.y = this.canvas.height / 100;
    this.dominationText.setFontSize(this.canvas.width / 30);
}

  if(this.spicyMeter && this.spicyMeter.visible) {



    this.spicyMeter.destroy();
    this.spicyMeter = new HealthBar(this, this.canvas.width / 4, this.canvas.height - this.canvas.height / 15, this.canvas.width / 2, this.canvas.height / 20, "spicy", true ).setDepth(10);
    if(this.deathScreen && this.deathScreen.visible ) {
    this.spicyMeter.draw();
    }
    this.spiceText.x = this.canvas.width / 2;
    this.spiceText.y = this.spicyMeter.y;

    this.spiceText.setFontSize(this.canvas.width / 30);
    this.spiceText.y -= this.spiceText.displayHeight;

    this.cameras.main.ignore(this.spicyMeter);
    this.minimap.ignore(this.spicyMeter);

  }

  if(this.minimap) {
    this.minimap.width = this.canvas.width/ 5;
    this.minimap.height = this.canvas.width/ 5;
    this.minimap.y = this.canvas.height - this.minimap.height - 10;
    this.minimap.x = this.canvas.width - this.minimap.width - 10;
    var mapSize = 4000
    //calculate zoom
    var zoom = this.minimap.width / mapSize;
    this.minimap.setZoom(zoom);
    this.minimap.setBackgroundColor(this.team == "blue" ? 0x002244 : 0x442200);
  }

    if(this.deathScreen && this.deathScreen.visible) {
      this.deathScreen.resize();
    }
  }
  var doit: string | number | NodeJS.Timeout;

  window.addEventListener("resize", function() {
    clearTimeout(doit);
    doit = setTimeout(resize, 100);
  });

  resize();
  }
  update(time: number, delta: number): void {
    
   Array.from(this.players.values()).forEach(player => player.updateObject());
   Array.from(this.bullets.values()).forEach(bullet => bullet.updateObject());
   if(this.background) {
   this.background.setTilePosition(this.cameras.main.scrollX , this.cameras.main.scrollY );
   this.background.x = this.cameras.main.scrollX + this.canvas.width*1.1 / 2;
    this.background.y = this.cameras.main.scrollY + this.canvas.height*1.1 / 2;
   }

   if(this.spicyMeter && this.spicyMeter.visible) {
    this.spicyMeter.updateContainer();
   }

   if(this.dominationBar && this.dominationBar.visible) {
    var totalDomination = {
      red: 0,
      blue: 0,
      none: 0
    }
    var i = 0;
      this.islands.forEach(island => {
         if(island.x == 0 && island.y == 0) return;
        var d = island.getDomination();

        totalDomination.red += d.red;
        totalDomination.blue += d.blue;
        totalDomination.none += d.none;

        i++;
      });
      // console.log(totalDomination);

      totalDomination.red = (totalDomination.red*100) / (i );
      totalDomination.blue = (totalDomination.blue*100) / (i );
      totalDomination.none = (totalDomination.none*100) / (i );
      // console.log(totalDomination);
      this.dominationBar.setHealth(totalDomination.red, totalDomination.blue);

      var oppositeTeam = this.team == "red" ? "blue" : "red";
      // console.log(this.team);

      if(this.socket && this.players.has(this.socket.id)) {
    this.mouseAngle =  Math.atan2((this.gamePoint?.y ?? this.game.input.activePointer.y) - (this.canvas.height /2), (this.gamePoint?.x ?? this.game.input.activePointer.x) - (this.canvas.width / 2));
// console.log(this.game.input.activePointer.x, this.game.input.activePointer.y, this.gamePoint);
      //distance from center to mouse
      var distance = Math.sqrt(Math.pow(this.game.input.mousePointer.x - (this.canvas.width / 2), 2) + Math.pow(this.game.input.mousePointer.y - (this.canvas.height / 2), 2));
        var ratio = (this.canvas.width + this.canvas.height) / 2;
        // console.log(distance/ratio)
        if(distance/ratio >= 0.1) {
          distance = Math.min(distance/ratio * 10, 1);
        } else if (distance/ratio < 0.05) {
          distance = 0;
        } else {
          distance = Math.min(distance/ratio * 4, 1);
        }
        // console.log(distance);
        
      // console.log(this.players.get(this.socket.id).needsFlip);
      this.socket.emit("mouse", this.mouseAngle, distance, this.players.get(this.socket.id).needsFlip);
      }

     if(this.team && !this.loadingText.visible) this.dominationText.setText(Math.round(totalDomination[this.team]) ==  Math.round(totalDomination[oppositeTeam]) ? "The game is tied!" : Math.round(totalDomination[this.team]) >  Math.round(totalDomination[oppositeTeam]) ? "Your team is winning!" : "Your team is losing!");
    }
     var show = 1200;
     var me = this.players.get(this.socket?.id);
    //  console.log(me?.image);
     if(me && me.image) this.lastKnownMyDisplayWidth = me.image?.displayWidth;

    //  console.log(this.lastKnownMyDisplayWidth);

     show += this.lastKnownMyDisplayWidth * 3;
    
     
     //var oldZoom = this.cameras.main.zoom;
     var newZoom = Math.max(this.scale.width / show, this.scale.height / show);
      this.cameras.main.setZoom(
       newZoom
     ); 
if(this.background) {
     this.background?.setTilePosition(this.cameras.main.scrollX , this.cameras.main.scrollY);
      // this.background.setTileScale(this.cameras.main.zoom)
     this.background.x = this.cameras.main.scrollX+this.canvas.width*1.005 / 2;
      this.background.y = this.cameras.main.scrollY+this.canvas.height*1.005 / 2;
      this.background.width = this.cameras.main.displayWidth*1.1;
      this.background.height = this.cameras.main.displayHeight*1.1;
}
      // console.log(this.background.tileScaleX, this.background.tileScaleY);
    
  }
}

export default GameScene;
