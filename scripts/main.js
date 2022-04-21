
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
    ],
    parent: "dom_id"    
  }
}

class Model {
  constructor ( ) {
    Object.entries(init_model).forEach((e,i) => {
      let [k,v] = e;
      this[k] = v;
    });
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