import Phaser from "phaser";
import { io, Socket } from "socket.io-client";
import Bullet from "./components/Bullet";
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

    constructor() {
      super("game");
    
    }
    preload() {
      this.loadingText = this.add.text(
        this.canvas.width / 2,
        this.canvas.height / 2,
        "Connecting...",
      ).setOrigin(0.5);
      this.ready = false;
      this.players = new Map();
      this.bullets = new Map();
      this.islands = [];
    }

    create() {
      this.socket = io();
      this.socket.emit("go", this.name);

      this.map = new GameMap(this);

      this.uiCam = this.cameras.add(0, 0, this.canvas.width, this.canvas.height);

      this.teamPicker = new TeamPicker(this);

     const playerJoined = (data: FirstPlayerData) =>{
        this.players.set(data.id, new Player(this, data.pos.x, data.pos.y, data.id, data.name, data.team).setDepth(2));
        if(this.socket.id === data.id) this.cameras.main.startFollow(this.players.get(data.id));
      }

      this.socket.on("playerJoined", (data: FirstPlayerData) => {
        console.log("playerJoined", data);
        playerJoined(data);
      });
      this.socket.on("playerLeft", (id: string) => {
        if(this.players.has(id)){
          this.players.get(id).destroy();
          this.players.delete(id);
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
          this.bullets.get(id).end();
          this.bullets.delete(id);
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
              bullet.end();
              this.bullets.delete(bullet.id);
            }, (1000/20)*2);
          }
        }
      });
      this.socket.on("islands", (data: IslandData[]) => {
        console.log("islands", data);
        this.islands = data.map(d => new Island(this, d).setDepth(1));
      });

      this.socket.on("bridges", (data: BridgeData[]) => {
        data.forEach(d => {
           var r = this.add.rectangle(d.pos.x, d.pos.y, d.width*2, d.length, 0xffffff).setDepth(0).setRotation(d.angle).setOrigin(0,0);
           this.uiCam.ignore(r);
        });
      });
      this.socket.on("islandCaptured", (id: number, team: string) => {
        console.log("islandCaptured", id, team);
        this.islands.find(i => i.id === id).setTeam(team);
        
      });
      this.socket.on("islandCapturing", (id: number, team: string, percent: number) => {
        console.log("islandCapturing", id, team, percent);
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

      this.socket.on("youDied", () => {
        this.players.get(this.socket.id).destroy();
        this.players.delete(this.socket.id);
        
      })
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
        console.log( 'Websocket RTT: ' + (Date.now() - start) + ' ms' );
      });
    }, 2000);

  }
  update(time: number, delta: number): void {
   Array.from(this.players.values()).forEach(player => player.updateObject());
   Array.from(this.bullets.values()).forEach(bullet => bullet.updateObject());

  if(!this.fpsCounter) this.fpsCounter = this.add.text(10, 10, "FPS: 0", {color: "white"}).setDepth(0);
  this.cameras.main.ignore(this.fpsCounter);
  this.fpsCounter.setText("FPS: " + this.game.loop.actualFps.toFixed(2));
  }
}

export default GameScene;