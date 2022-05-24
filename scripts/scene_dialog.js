
class DialogPortrait extends BasicObject {
  constructor(parent, x, y) {
    super(parent);
    this.setPosition = this.setPosition.bind(this);
    this.setImage = this.setImage.bind(this);
    this.x = x;
    this.y = y;
    this.img_key = "dialog_"+this.x+":"+Math.floor(Math.random()*50);
  }

  preload () {
    super.preload();
    
    this.img_key = "dialog_"+this.x+":"+Math.floor(Math.random()*50);
    console.log("Loading " + this.image_fn + " as " + this.img_key);
    this.scene.load.image(this.img_key, this.image_fn);
  }

  create () {
    super.create();
    this.rect = this.scene.add.rexRoundRectangle(0,0,128,128,12, 0x00ff00, 1);
    this.obj = this.scene.physics.add.existing(this.rect);
    this.obj.setPosition(this.x, this.y);
    this.portrait = this.scene.add.sprite(this.x, this.y, this.img_key);
    this.portrait.setDepth(2);
  }

  setPosition (x, y) {
    this.x = x;
    this.y = y;
    if (this.obj != undefined) {
      this.obj.setPosition(this.x, this.y);
    }
  }

  setImage (image_fn) {
    this.image_fn = image_fn;
  }
}

class DialogTextBubble extends BasicObject {
  constructor(parent, x, y, msg) {
    super(parent);
    this.setMsg = this.setMsg.bind(this);
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

  preload () {
    super.preload();
    let key = "lang_"+this.x;
  }

  create () {
    this.rect = this.scene.add.rexRoundRectangle(0,0,600,128,12, 0x0000ff, 1);
    this.obj = this.scene.physics.add.existing(this.rect);
    this.obj.setPosition(this.x, this.y);
    this.text = this.scene.add.text(this.x-200, this.y, "");
  }

  setPosition (x, y) {
    this.x = x;
    this.y = y;
    if (this.obj != undefined) {
      this.obj.setPosition(this.x, this.y);
      this.text.setPosition(this.x, this.y);
    }
  }

  setMsg (msg) {
    this.msg = msg;
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
    this.addObject("txt", new DialogTextBubble(this, 450, 200, "Blah blah blah"));
    this.pic_loc = { x: 128, y: 128 };
    this.dialog_loc = { x: 450, y: 200};
    this.play = this.play.bind(this);
    this.player_id = 0;
  }

  init () {
    super.init();
    this.objects.pic.setPosition(this.pic_loc.x, this.pic_loc.y);
    this.objects.txt.setPosition(this.dialog_loc.x, this.dialog_loc.y);
  }

  preload () {
    this.portrait_fn = getModel().game_ctx.players[this.player_id].portrait;
    this.objects.pic.setImage(this.portrait_fn);

    let msg_idx = Math.floor(getModel().game_ctx.players[this.player_id].language.taunt.length * Math.random());
    this.msg = getModel().game_ctx.players[this.player_id].language.taunt[msg_idx];
    this.objects.txt.setMsg(this.msg.txt);

    super.preload();
    this.audio_key = "wav_"+this.pic_loc.x+":"+Math.floor(Math.random()*50);

    if (this.msg.wav != undefined) {
      console.log("Loading sound " + this.msg.wav + " as key " + this.audio_key);
      this.scene.load.audio(this.audio_key, this.msg.wav);
    }
  }

  create () {
    super.create();
  }

  play (callback) {
    this.objects.txt.play(callback);

    if (this.msg.wav != undefined) {
      this.scene.sound.add(this.audio_key).play({ volume: getModel().options.sfx_volume*4 });
    }
  }
}

class DialogCharRight extends DialogCharLeft {
  constructor (parent) {
    super(parent);
    this.pic_loc = { x: 850, y: 325 };
    this.dialog_loc = { x: 530, y: 397};
    this.player_id = 1;
  }

  init () {
    super.init();
  }
}

const DialogStates = {
  LOADING: 0,
  PLAYER_ONE_TALKING: 1,
  PLAYER_TWO_TALKING: 2,
  CUTSCENE_DONE: 3
}

const DialogEvents = {
  LOADING_DONE: 0,
  PLAYER_DONE: 1
}

class SceneDialog extends BasicScene {
  constructor () {
    super("SceneDialog");
    this.fsm = this.fsm.bind(this);

    this.addObject("bgimg", new BackgroundImage(this, 0, 0, "dialog_bg", "images/forest_bg.jpeg"))
    this.addObject("left", new DialogCharLeft(this));
    this.addObject("right", new DialogCharRight(this));
    this.addObject("bgm", new BgmAgent(this));
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
    this.objects.bgm.play('menu_bgm');
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
        this.state = DialogStates.CUTSCENE_DONE;
        this.scene.start("SceneGameV2");
        break;
      default:
        break;
    }
  }

  update () {
    super.update();

    
    this.input.keyboard.on('keyup', (event) => {
      switch (event.code) {
        case "Space":
          if (this.state != DialogStates.CUTSCENE_DONE) {
            console.log("Anykey pressed.");
            this.scene.start("SceneGameV2");
            this.state = DialogStates.CUTSCENE_DONE;
          }
          break;
      }
    });

    if (this.state == DialogStates.LOADING) {
      let now = Date.now();
      if (now > this.start_time + 1000) {
        this.fsm(DialogEvents.LOADING_DONE);
      }
    }
  }

}