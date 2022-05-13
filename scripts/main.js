
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
      SceneGame,
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
        { x: 100, y: 350, dir: "left" },
        { x: 200, y: 350, dir: "right" }

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