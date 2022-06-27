import Phaser from "phaser";
import { io, Socket } from "socket.io-client";
import Bullet from "./components/Bullet";
import DeathScreen from "./components/DeathScreen";
import HealthBar from "./components/HealthBar";
import Island from "./components/Island";
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

      this.uiCam = this.cameras.add(0, 0, this.canvas.width, this.canvas.height);

      this.teamPicker = new TeamPicker(this);
      this.cameras.main.ignore(this.teamPicker);

      var team = "red";

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

      this.map = new GameMap(this);
      this.dominationBar = new HealthBar(this, this.canvas.width / 4, this.canvas.height /100, this.canvas.width / 2, this.canvas.height / 20, "domination" ).setDepth(10);
      this.dominationBar.draw();
      this.cameras.main.ignore(this.dominationBar);
      this.dominationBar.bar.x -= this.dominationBar.width / 2;

     const playerJoined = (data: FirstPlayerData) =>{
        this.players.set(data.id, new Player(this, data.pos.x, data.pos.y, data.id, data.name, data.team).setDepth(2));
        if(this.socket.id === data.id) this.cameras.main.startFollow(this.players.get(data.id), false, 0.2, 0.2);
      }

      this.socket.on("playerJoined", (data: FirstPlayerData) => {
        // console.log("playerJoined", data);
        playerJoined(data);
      });
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
           var r = this.add.rectangle(d.pos.x, d.pos.y, d.width*2, d.length, 0xffffff).setDepth(0).setRotation(d.angle).setOrigin(0,0);
           this.uiCam.ignore(r);
        });
      });
      this.socket.on("islandCaptured", (id: number, team: string) => {
        // console.log("islandCaptured", id, team);
        this.islands.find(i => i.id === id).setTeam(team);
        
      });
      this.socket.on("islandCapturing", (id: number, team: string, percent: number) => {
        // console.log("islandCapturing", id, team, percent);
        this.islands.find(i => i.id === id).setPercent(percent, team);

      })
      // this.socket.on("corners", (data: {x: number, y: number}[]) => {
      //   data.forEach(d => {
      //     var el = this.add.ellipse(d.x, d.y, 5, 5, 0x00ff00).setDepth(10);
      //     setTimeout(() => {
      //       el.destroy();
      //     }, 1000/20);
      //   });
      // });
      this.socket.on("playerUpdate", (data: PlayerData, object: {hit: boolean}) => {
        if(!this.ready) return;
        if(!this.players.has(data.id)) return;
        this.players.get(data.id).tick(data, object.hit);
      });
      // this.socket.on("test", (pos, corners) => {
      //   console.log(pos);
      //   this.add.circle(pos.x, pos.y, 5, 0x00FF0F).setOrigin(0.5).setDepth(0);
      //   this.add.circle(corners[0].x, corners[0].y, 10, 0x00FF00).setOrigin(0.5);
      //   this.add.circle(corners[1].x, corners[1].y, 10, 0x00FF00).setOrigin(0.5);
      //   this.add.circle(corners[2].x, corners[2].y, 10, 0x00FF00).setOrigin(0.5);
      //   this.add.circle(corners[3].x, corners[3].y, 10, 0x00FF00).setOrigin(0.5);
      // })

      this.socket.on("youDied", ({reason, who, survivedTime, shotDragons, peppers}) => {
       var me = this.players.get(this.socket.id);
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
      })
      this.socket.on("shotDragon", ({who, id, reason}) => {
        // console.log("shotDragon", who, id, reason);
        var txt = `[b][color=#e82a1f]Shot [/color][color=#0000FF]${who}[/color][/b]`;
        const convert = (num, val, newNum) => (newNum * val) / num;
        var fontsize = convert(1366, 64, this.canvas.width);
					var text = (this.add as any).rexBBCodeText(this.canvas.width/2, this.canvas.height, txt).setOrigin(0.5).setAlpha(0).setFontSize(fontsize);

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
      });
      var keys = (this.input.keyboard.addKeys({
        up: 'up',
        down: 'down',
        left: 'left',
        right: 'right',
        w: 'W',
        s: 'S',
        a: 'A',
        d: 'D',
    }) as Keys);  

    this.controller = {
      up: false,
      down: false,
      left: false,
      right: false,
    }

    keys.up.on('down', () => {
      this.controller.up = true;
      this.socket.emit("controller", this.controller);
    });
    keys.down.on('down', () => {
      this.controller.down = true;
      this.socket.emit("controller", this.controller);
    });
    keys.left.on('down', () => {
      this.controller.left = true;
      this.socket.emit("controller", this.controller);
    }); 
    keys.right.on('down', () => {
      this.controller.right = true;
      this.socket.emit("controller", this.controller);
    });
    keys.w.on('down', () => {
      this.controller.up = true;
      this.socket.emit("controller", this.controller);
    });
    keys.s.on('down', () => {
      this.controller.down = true;
      this.socket.emit("controller", this.controller);
    });
    keys.a.on('down', () => {
      this.controller.left = true;
      this.socket.emit("controller", this.controller);
    });
    keys.d.on('down', () => {
      this.controller.right = true;
      this.socket.emit("controller", this.controller);
    });

    keys.up.on('up', () => {
      this.controller.up = false;
      this.socket.emit("controller", this.controller);
    });
    keys.down.on('up', () => {
      this.controller.down = false;
      this.socket.emit("controller", this.controller);
    });
    keys.left.on('up', () => {
      this.controller.left = false;
      this.socket.emit("controller", this.controller);
    }); 
    keys.right.on('up', () => {
      this.controller.right = false;
      this.socket.emit("controller", this.controller);
    });
    keys.w.on('up', () => {
      this.controller.up = false;
      this.socket.emit("controller", this.controller);
    });
    keys.s.on('up', () => {
      this.controller.down = false;
      this.socket.emit("controller", this.controller);
    });
    keys.a.on('up', () => {
      this.controller.left = false;
      this.socket.emit("controller", this.controller);
    });
    keys.d.on('up', () => {
      this.controller.right = false;
      this.socket.emit("controller", this.controller);
    });

    this.mouseAngle =  Math.atan2(this.game.input.mousePointer.y - (this.canvas.height /2), this.game.input.mousePointer.x - (this.canvas.width / 2));
    //on mouse move
    this.input.on("pointermove", () => {
     this.mouseAngle =  Math.atan2(this.game.input.mousePointer.y - (this.canvas.height /2), this.game.input.mousePointer.x - (this.canvas.width / 2))
      this.socket.emit("mouse", this.mouseAngle);
    });

    this.input.on("pointerdown", () => {
      this.socket.emit("down", true);
    })
    this.input.on("pointerup", () => {
      this.socket.emit("down", false);
    });

    setInterval(() => {
      var start = Date.now();
      this.socket.emit( 'ping', function clientCallback() {
        // console.log( 'Websocket RTT: ' + (Date.now() - start) + ' ms' );
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

   if(this.dominationBar && this.dominationBar.visible) {
    var totalDomination = {
      red: 0,
      blue: 0,
      none: 0
    }
    var i = 0;
      this.islands.forEach(island => {
        if(island.x == 0 && island.y == 0) return console.log("fuc")
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


    }
  }
}

export default GameScene;
