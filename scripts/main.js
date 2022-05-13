
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
      SceneContinue
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
        { x: 250, y: 200 }
      ],
      flippers: [
        { x: 80, y: 348, dir: "left" },
        { x: 220, y: 348, dir: "right" }

      ],
      rails: [
        { x1: 0, y1: 320, x2: 80, y2: 340 },
        { x1: 300, y1: 320, x2: 220, y2: 340 }
      ],
      bumpers: [
        { x: 60, y: 50 },
        { x: 110, y: 70 },
        { x: 60, y: 100 }
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