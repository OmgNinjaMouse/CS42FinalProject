
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

class SelectSprite extends RelocatableObject {
  constructor (parent, x, y, index) {
    super(parent, x, y);
    this.playAni = this.playAni.bind(this);
    this.preselect_idx = index;
    this.side = (index == 0) ? "left_" : "right_";
  }

  init () {

    console.log("SelectSprite Init");
    console.log(getModel().game_ctx.characters);
    this.sprites = [];
    getModel().game_ctx.characters.forEach( (char, idx) => {
      console.log("Building select sprite " + char.key + " sheet:" + char.sprites);
      this.sprites.push(this.addObject(char.key, new LpcSprite(this, char.key, char.sprites, 0, 0)));  
    })
    this.active_sprite = -1;

    super.init();
  }

  preload () {
    super.preload();
  }

  create () {
    super.create();
  }

  update () {
    super.update();

    this.active_sprite = getModel().game_ctx.preselects[this.preselect_idx];
    this.sprites.forEach( (sprite, idx) => {
      if (idx == this.active_sprite) {
        sprite.setVisible(true);
      } else {
        sprite.setVisible(false);
      }
    })
  }

  playAni (ani_name) {
    this.sprites.forEach( (sprite, idx) => {
      sprite.playAni(ani_name);
    })
  }
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
    this.scene.load.image("placeholder", "./sprites/placeholder.png");
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
    this.portrait = this.scene.add.sprite(this.x, this.y, "placeholder");
    this.portrait.setScale(0.45);
    this.portrait.setDepth(2);

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

    if (this.state == PortraitStates.SELECTED) {
      if (this.preselect_cb != undefined) {
        this.preselect_cb(this.id);
      }
    }
  }

  setPreselectCb(callback) {
    this.preselect_cb = callback;
  }

  setLockedCb (callback) {
    this.callback = callback;
  }

  setPortrait (key, image_fn) {
    console.log("Starting lazy load for key " + key + " file " + image_fn);
    this.scene.load.image(key, image_fn)
	  this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
		  // texture loaded so use instead of the placeholder
      console.log("Lazy load finished for " + key );
		  this.portrait.setTexture(key)
      this.portrait.setScale(0.4);
	  })
	  this.scene.load.start()
  }
}

class SelectGallery extends BasicObject {
  constructor (parent) {
    super(parent);
    this.setPortrait = this.setPortrait.bind(this);
    this.num_chars = 8;
    this.chars_per_row = 4;
    this.sprite_width = 70;

    for (let i=0; i<this.num_chars; i++) {
      let col = i % this.chars_per_row;
      let row = Math.floor(i / this.chars_per_row);
      let center_x = (getModel().config.width / 2) + 35;
      let start_y = getModel().config.height * 0.75;
      let x = center_x + (this.sprite_width * (col - 2));
      let y = start_y + (this.sprite_width * row);

      this.addObject("char_" + i, new SelectPortrait(this, i, x, y))
        .setPreselectCb((id) => {
          switch(parent.state) {
            case SelectStates.PLAYER_ONE_WAITING:
              getModel().game_ctx.preselects[0] = id;
              break;
            case SelectStates.PLAYER_TWO_WAITING:
              getModel().game_ctx.preselects[1] = id;
              break;
            case SelectStates.DISPLAY:
              break;
          }
        });
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

  setPortrait(index, image_fn) {
    let key = "char_" + index;
    this.objects[key].setPortrait(key, image_fn);
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

    this.addObject("bgimg", new BackgroundImage(this, 0, 0, "select_bg", "images/world_map.png"))
    this.addObject("title", new MainTitle(this, 960/2, 50, "Player Select"))
    this.addObject("subtitle", new SubTitle(this, 960/2, 200, "VS"))
    this.addObject("gallery", new SelectGallery(this));
    this.addObject("bgm",       new BgmAgent(this));
    this.addObject("left_name", new Nameplate(this, 160,350));
    this.addObject("right_name", new Nameplate(this, 800,350)).justify(true);
    this.addObject("sprite_left", new SelectSprite(this, 200, 200, 0));
    this.addObject("sprite_right", new SelectSprite(this, 760, 200, 1));

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

    this.load.json('character_data', 'characters/characters.json');
   
  }

  create () {
    super.create();
    this.objects.gallery.setLockedCb(this.choiceMade);
    this.objects.bgm.play('menu_bgm');

    this.characters = this.cache.json.get('character_data');
    console.log(this.characters);
    getModel().game_ctx.characters = this.characters.characters;
    this.characters.characters.forEach( (character, idx) => {
      this.objects.gallery.setPortrait(idx, character.portrait);
    })

    getModel().game_ctx.preselects = [ -1, -1];
  }

  fsm (event, character_id) {
    let old_state = this.state;
    switch (this.state) {
      case SelectStates.PLAYER_ONE_WAITING:
        switch (event) {
          case SelectEvents.SELECTION_MADE:
            console.log("Player One has chosen: " + character_id);
            this.state = SelectStates.PLAYER_TWO_WAITING;
            this.player_one = character_id;
            getModel().game_ctx.preselects[0] = character_id;
            this.objects.left_name.setName(this.characters.characters[this.player_one].name);
            this.objects.gallery.selectRandom();
            break;
        }
        break;
      case SelectStates.PLAYER_TWO_WAITING:
        switch (event) {
          case SelectEvents.SELECTION_MADE:
            console.log("Player Two has chosen: " + character_id);
            this.player_two = character_id;
            getModel().game_ctx.preselects[1] = character_id;
            this.objects.right_name.setName(this.characters.characters[this.player_two].name);

            this.state = SelectStates.DISPLAY;
            break;
        }
        break;
      case SelectStates.DISPLAY:
        switch (event) {
          case SelectEvents.DISPLAY_DONE:
            console.log("Start Game!@!!");
            let mdl = getModel().game_ctx.players;
            let p1_char = this.characters.characters[this.player_one];
            let p2_char = this.characters.characters[this.player_two];
            mdl[0] = {
              name: p1_char.name,
              key: p1_char.key,
              health: 200,
              spritesheet: p1_char.sprites,
              portrait: p1_char.portrait,
              language_fn: p1_char.language
            }
            mdl[1] = {
              name: p2_char.name,
              key: p2_char.key,
              health: 200,
              spritesheet: p2_char.sprites,
              portrait: p2_char.portrait,
              language_fn: p2_char.language
            }

            getModel().game_ctx.level_fn = p2_char.level;

            this.load.json("field"+p2_char.name, getModel().game_ctx.level_fn);
            this.load.json("p1_lang"+p1_char.name, getModel().game_ctx.players[0].language_fn);
            this.load.json("p2_lang"+p2_char.name, getModel().game_ctx.players[1].language_fn);
            this.load.once(Phaser.Loader.Events.COMPLETE, () => {
              console.log("Level JSON loaded from " + getModel().game_ctx.level_fn);
              let ctx = getModel().game_ctx;
              ctx.level = this.cache.json.get('field'+p2_char.name);
              getModel().game_ctx.players[0].language = this.cache.json.get("p1_lang"+p1_char.name);
              getModel().game_ctx.players[1].language = this.cache.json.get("p2_lang"+p2_char.name);
              this.scene.start("SceneDialog");
            });
            this.load.start();
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
      if (now > (this.state_changed_at + 2000)) {
        this.fsm(SelectEvents.DISPLAY_DONE);
      }
    }
  }
}