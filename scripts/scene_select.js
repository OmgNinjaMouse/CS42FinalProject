
// Dotted Line example : http://phaser.io/examples/v3/view/geom/line/get-points

const PortraitStates = {
  IDLE: 0,
  SELECTED: 1,
  LOCKING: 2,
  LOCKED: 3,
  DEFEATED: 4
}

const PortraitEvents = {
  ENTER: 0,
  EXIT: 1,
  CLICKED: 2,
  TIMEOUT: 3
}

class SelectPortrait extends BasicObject {
  constructor (parent, id, x, y) {
    super(parent);
    this.redraw = this.redraw.bind(this);
    this.fsm = this.fsm.bind(this);
    this.setLockedCb = this.setLockedCb.bind(this);
    this.disableMouse = this.disableMouse.bind(this);
    this.select = this.select.bind(this);
    this.unselect = this.unselect.bind(this);

    this.id = id;
    this.x = x;
    this.y = y;
  }

  init () {
    this.state = PortraitStates.IDLE;
    this.mouse_events = true;
  }

  preload () {
    this.graphics = this.scene.add.graphics();
  }

  redraw () {
    this.rect = this.scene.add.rexRoundRectangle(this.x,this.y,64,64,12, 0x00ff00, 1);
    this.obj = this.scene.physics.add.existing(this.rect);
    this.obj.setPosition(this.x, this.y);
    this.obj.setInteractive();

    this.obj.on("pointerover", () => {
      if (this.mouse_events) {
        this.fsm(PortraitEvents.ENTER);
      }
    });

    this.obj.on("pointerout", () => {
      if (this.mouse_events) {
        this.fsm(PortraitEvents.EXIT);
      }
    });

    this.obj.on("pointerup", () => {
      if (this.mouse_events) {
        this.fsm(PortraitEvents.CLICKED);
      }
    });
  }

  create () {
    super.create();
    this.redraw();
  }

  disableMouse () {
    this.mouse_events = false;
  }

  fsm (event) {
    let old_state = this.state;
    switch (this.state) {
      case PortraitStates.IDLE:
        switch (event) {
          case PortraitEvents.ENTER:  this.state = PortraitStates.SELECTED; break;
        }
        break;
      case PortraitStates.SELECTED:
        switch (event) {
          case PortraitEvents.EXIT:   this.state = PortraitStates.IDLE; break;
          case PortraitEvents.CLICKED: this.state = PortraitStates.LOCKING; break;
        }
        break;
      case PortraitStates.LOCKING:
        switch (event) {
          case PortraitEvents.TIMEOUT: 
            this.state = PortraitStates.LOCKED; 
            this.callback(this.id);
          break;
        }
        break;
      case PortraitStates.LOCKED:
        break;
    }


    if (old_state != this.state) {
      console.log("char" + this.id + " state " + this.state);
      this.state_changed_at = Date.now();
    }
  }

  unselect () {
    this.fsm(PortraitEvents.EXIT);
  }

  select () {
    this.fsm(PortraitEvents.ENTER);
  }

  lock () {
    this.fsm(PortraitEvents.CLICKED);
  }

  update () {
    let now = Date.now();
    let color = 0x111111;

    if ((now - this.state_changed_at) > 1000) {
      this.fsm(PortraitEvents.TIMEOUT);
    }

    switch (this.state) {
      case PortraitStates.IDLE:     color = 0x114411; break;
      case PortraitStates.SELECTED: color = 0x11ccaa; break;
      case PortraitStates.LOCKING:  color = (now % 200 < 100) ? 0xaaccaa : 0x00ff00; break;
      case PortraitStates.LOCKED:   color = 0xff0000; break;
      case PortraitStates.DEFEATED: color = 0x111111; break;
    }

    if (this.rect) {
      this.rect.setFillStyle(color);
    }
  }

  setLockedCb (callback) {
    this.callback = callback;
  }
}

class SelectGallery extends BasicObject {
  constructor (parent) {
    super(parent);
    this.num_chars = 8;
    this.chars_per_row = 4;
    this.sprite_width = 70;

    for (let i=0; i<this.num_chars; i++) {
      let col = i % this.chars_per_row;
      let row = Math.floor(i / this.chars_per_row);
      let center_x = getModel().config.width / 2;
      let start_y = getModel().config.height * 0.6;
      let x = center_x + (this.sprite_width * (col - 2));
      let y = start_y + (this.sprite_width * row);

      this.addObject("char_" + i, new SelectPortrait(this, i, x, y));
    }
  }

  init () {
    super.init();
    this.randomize = false;
  }

  setLockedCb (callback) {
    this.allObjects().forEach( (obj) => {
      obj.setLockedCb((id) => {
        obj.disableMouse();
        callback(id)
      });
    })
  }

  selectRandom () {
    this.randomize = true;
    this.last_randomize = Date.now();
    this.randomize_selection = 0;
    this.randomize_delay = 10;
    this.randomize_possibles = 
      this.allObjects()
        .map( (obj) => { return { id: obj.id, state: obj.state }})
        .filter( (obj_data) => { return obj_data.state != PortraitStates.LOCKED })
        .filter( (obj_data) => { return obj_data.state != PortraitStates.DEFEATED })
        .map( (obj_data) => obj_data.id );
      console.log(this.randomize_possibles);

      }

  update () {
    super.update();

    if (this.randomize) {
      let now = Date.now();
      if (now > (this.last_randomize + this.randomize_delay)) {

        if (this.randomize_delay < 1000)  {
          this.last_randomize = now;
          this.randomize_delay = this.randomize_delay * 1.5;
          this.objects["char_" + this.randomize_selection].unselect();
          this.randomize_selection = this.randomize_possibles[Math.floor(Math.random() * this.randomize_possibles.length)];

          console.log("Picking " + this.randomize_selection);
          this.objects["char_" + this.randomize_selection].select();
        } else {
          console.log("Locking " + this.randomize_selection);
          this.objects["char_" + this.randomize_selection].lock();
          this.randomize = false;
        }
      }
    }
  }
}

const SelectStates = {
  PLAYER_ONE_WAITING: 0,
  PLAYER_TWO_WAITING: 1,
  DISPLAY: 2
}

const SelectEvents = {
  SELECTION_MADE: 0,
  SHOT_CLOCK: 1,
  DISPLAY_DONE: 2
}

class SceneSelect extends BasicScene {
  constructor () {
    super("SceneSelect");
    this.choiceMade = this.choiceMade.bind(this);
    this.fsm = this.fsm.bind(this);

    this.addObject("gallery", new SelectGallery(this));
  }

  init () {
    super.init();
    this.state = SelectStates.PLAYER_ONE_WAITING;
    this.state_changed_at = Date.now();
  }

  preload () {
    super.preload();
    this.load.plugin('rexroundrectangleplugin', 'resources/rexroundrectangleplugin.min.js', true);   
    //this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectangleplugin.min.js', true);   
    
  }

  create () {
    super.create();
    this.objects.gallery.setLockedCb(this.choiceMade);
  }

  fsm (event, character_id) {
    let old_state = this.state;
    switch (this.state) {
      case SelectStates.PLAYER_ONE_WAITING:
        switch (event) {
          case SelectEvents.SELECTION_MADE:
            console.log("Player One has chosen: " + character_id);
            this.state = SelectStates.PLAYER_TWO_WAITING;
            this.objects.gallery.selectRandom();
            break;
        }
        break;
      case SelectStates.PLAYER_TWO_WAITING:
        switch (event) {
          case SelectEvents.SELECTION_MADE:
            console.log("Player Two has chosen: " + character_id);
            this.state = SelectStates.DISPLAY;
            break;
        }
        break;
      case SelectStates.DISPLAY:
        switch (event) {
          case SelectEvents.DISPLAY_DONE:
            //this.scene.start("SceneGame");
            console.log("Start Game!@!!");
            break;
        }
        break;
      
    }

    if (old_state != this.state) {
      console.log("scene state " + this.state);
      this.state_changed_at = Date.now();
    }
  }

  choiceMade (character_id) {
    this.fsm(SelectEvents.SELECTION_MADE, character_id);
  }

  update () {
    super.update();
    let now = Date.now();
    if (this.state == SelectStates.DISPLAY) {
      if (now > (this.state_changed_at + 5000)) {
        this.fsm(SelectEvents.DISPLAY_DONE);
      }
    }
  }
}