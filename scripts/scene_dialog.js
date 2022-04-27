
class DialogPortrait extends BasicObject {
  constructor(parent, x, y) {
    super(parent);
    this.x = x;
    this.y = y;
  }

  create () {
    super.create();
    this.rect = this.scene.add.rexRoundRectangle(0,0,128,128,12, 0x00ff00, 1);
    this.obj = this.scene.physics.add.existing(this.rect);
    this.obj.setPosition(this.x, this.y);
  }

  setPosition (x, y) {
    this.x = x;
    this.y = y;
    this.obj.setPosition(this.x, this.y);
  }
}

class DialogTextBubble extends BasicObject {
  constructor(parent, x, y, msg) {
    super(parent);
    this.x = x;
    this.y = y;
    this.msg = msg;
    this.play = this.play.bind(this);
  }

  init () {
    super.init();
    this.letter_count = 0;
    this.last_letter = -1;
    this.letter_delay = 200;
    this.playing = false;
  }

  create () {
    this.rect = this.scene.add.rexRoundRectangle(0,0,600,128,12, 0x0000ff, 1);
    this.obj = this.scene.physics.add.existing(this.rect);
    this.obj.setPosition(this.x, this.y);

    this.text = this.scene.add.text(this.x, this.y, "");
  }

  setPosition (x, y) {
    this.x = x;
    this.y = y;
    this.obj.setPosition(this.x, this.y);
    this.text.setPosition(this.x, this.y);
  }

  play (callback) {
    this.callback = callback;
    this.playing = true;
  } 

  update () {
    if (this.playing) {
      let now = Date.now();
      if (now > this.last_letter + 100) {
        this.last_letter = now;
        if (++this.letter_count > this.msg.length) {
          this.playing = false;
          this.callback();
        } else {
          this.text.setText(this.msg.substring(0, this.letter_count));
        }
      }
    }
  }
}

class DialogCharLeft extends BasicObject {
  constructor(parent) {
    super(parent);
    this.addObject("pic", new DialogPortrait(this, 128, 128));
    this.addObject("txt", new DialogTextBubble(this, 450, 200, "Blah blah blah blah"));
    this.pic_loc = { x: 128, y: 128 };
    this.dialog_loc = { x: 450, y: 200};
    this.play = this.play.bind(this);
  }

  create () {
    super.create();
    this.objects.pic.setPosition(this.pic_loc.x, this.pic_loc.y);
    this.objects.txt.setPosition(this.dialog_loc.x, this.dialog_loc.y);
  }

  play (callback) {
    this.objects.txt.play(callback);
  }
}

class DialogCharRight extends DialogCharLeft {
  constructor (parent) {
    super(parent);
    this.pic_loc = { x: 850, y: 325 };
    this.dialog_loc = { x: 530, y: 397};
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
    this.addObject("right", new DialogCharRight(this));

  }

  init () {
    super.init();
    this.state = DialogStates.LOADING;
    this.start_time = Date.now();
  }

  preload () {
    super.preload();
    this.load.plugin('rexroundrectangleplugin', 'resources/rexroundrectangleplugin.min.js', true);   
  }

  create () {
    super.create();
  }

  fsm (event) {
    switch (this.state) {
      case DialogStates.LOADING:
        switch (event) {
          case DialogEvents.LOADING_DONE:  
            this.state = DialogStates.PLAYER_ONE_TALKING;
            this.objects.left.play(() => this.fsm(DialogEvents.PLAYER_DONE));
            break;
        }
        break;
      case DialogStates.PLAYER_ONE_TALKING:
        switch (event) {
          case DialogEvents.PLAYER_DONE:  
            this.state = DialogStates.Player_TWO_TALKING;
            this.objects.right.play(() => this.fsm(DialogEvents.PLAYER_DONE));
            break;
        }
        break;
      case DialogStates.Player_TWO_TALKING:
        console.log("Talking all done!");
        this.scene.start("SceneGame");
        break;
    }
  }

  update () {
    super.update();
    if (this.state == DialogStates.LOADING) {
      let now = Date.now();
      if (now > this.start_time + 1000) {
        this.fsm(DialogEvents.LOADING_DONE);
      }
    }
  }

}