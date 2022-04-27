
class DialogPortrait extends BasicObject {
  constructor(parent) {
    super(parent);
  }

  create () {
    super.create();
    this.rect = this.scene.add.rexRoundRectangle(this.x,this.y,64,64,12, 0x00ff00, 1);
    this.obj = this.scene.physics.add.existing(this.rect);
    this.obj.setPosition(this.x, this.y);
  }
}

class DialogTextBubble extends BasicObject {
  constructor(parent) {
    super(parent);
  }
}

class DialogCharLeft extends BasicObject {
  constructor(parent) {
    super(parent);
    this.addObject("pic", new DialogPortrait(this));
    this.addObject("txt", new DialogTextBubble(this));
  }
}

class DialogCharRight extends DialogCharRight {
  constructor (parent) {
    super(parent);
  }
}

const DialogStates = {
  LOADING: 0,
  PLAYER_ONE_TALKING: 1,
  PLAYER_TWO_TALKING: 2,
}

const DialogEvents = {
  LOADING_DONE: 0,
  PLAYER_DONE: 1
}

class SceneDialog extends BasicScene {
  constructor () {
    super("SceneDialog");
    this.fsm = this.fsm.bind(this);

    this.addObject("left", new DialogCharLeft(this));
  }

  init () {
    super.init();
    this.state = DialogStates.LOADING;
  }

  preload () {
    super.preload();
    this.load.plugin('rexroundrectangleplugin', 'resources/rexroundrectangleplugin.min.js', true);   
  }

  create () {
    super.create();
  }

  fsm () {
    switch (this.state) {
      case DialogStates.LOADING:
        break;
      case DialogStates.PLAYER_ONE_TALKING:
        break;
      case DialogStates.Player_TWO_TALKING:
        break;
    }
  }

  update () {
    super.update();
  }

}