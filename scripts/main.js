
const init_model = {
  config: {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [
      SceneTitle,
      SceneOptions,
      SceneSelect,
      SceneDialog,
      SceneGameV2,
      SceneContinue,
      SceneTest
    ],
    parent: "dom_id"    
  },
  options: {
    bgm_volume: 0.5,
    bgm_enable: true,
    sfx_volume: 0.5,
    sfx_enable: true
  },
  game_ctx: {
    time_remaining: 0,
    players: [
      {
        name: "Princess",
        key: "princess",
        health: 100,
        spritesheet: "./characters/princess/spritesheet.png"
      },
      {
        name: "Bad Wolf",
        key: "badwolf",
        health: 100,
        spritesheet: "./characters/badwolf/spritesheet.png"
      }
    ],
    level: {
      ball: [
        { x: 270, y: 300 }
      ],
      launcher: [
        { x: 270, y: 360 }
      ],
      flippers: [
        { x: 80, y: 348, dir: "left" },
        { x: 220, y: 348, dir: "right" }
      ],
      slingshot: [
        { x: 60, y: 268, dir: "left" },
        { x: 235, y: 268, dir: "right" },
      ],
      rails: [
        { x1: 0, y1: 320, x2: 80, y2: 340 },
        { x1: 250, y1: 320, x2: 220, y2: 340 },
        { x1: 250, y1: 0, x2: 300, y2: 40 },
        { x1: 160, y1: 0, x2: 140, y2: 50 },
      ],
      wires: [
        { x1: 150, y1: 65, x2: 150, y2: 95 },
        { x1: 185, y1: 65, x2: 185, y2: 95 },
        { x1: 220, y1: 65, x2: 220, y2: 95 },
        { x1: 255, y1: 65, x2: 255, y2: 95 }
      ],
      bumpers: [
        { x: 60, y: 50 },
        { x: 110, y: 70 },
        { x: 60, y: 100 }
      ],
      rollover: [
        { x: 167, y: 75 },
        { x: 185+17, y: 75 },
        { x: 220+17, y: 75 }
      ],
    }
  }
}

class Model {
  constructor ( ) {
    Object.entries(init_model).forEach((e,i) => {
      let [k,v] = e;
      this[k] = v;
    });

    this.bgm = new BgmManager();
  }

  setDomId (dom_id) {
    this.config.parent = dom_id;
  }
}

class Game {
  constructor (dom_id) {
    this.model = new Model();
    this.model.setDomId(dom_id);
    
    this.phaser = new Phaser.Game(this.model.config);
    this.phaser.model = this.model;
  }  
}

function getModel() {
  return game_obj.model;
}