
const Dir = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
  NONE: 4
}

class SpriteBasic extends RelocatableObject {
  constructor (parent, key, spritesheet_fn, x, y) {
    super(parent, x, y);
    this.key = key;
    this.spritesheet_fn = spritesheet_fn;
    
    this.init = this.init.bind(this);
    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  init () {
    super.init();
    this.ani = '';
    this.last_ani = '';
  }

  preload (frameWidth, frameHeight, rowSize) {
    super.preload();
    this.rowSize = rowSize;
    this.scene.load.spritesheet(this.key, 
                                this.spritesheet_fn, 
                                {
                                  frameWidth: frameWidth,
                                  frameHeight: frameHeight
                                });    
  }

  create (aniList) {
    super.create();
    aniList.forEach( (ani) => {
      let frm_spec = { start:ani.row*this.rowSize, end: (ani.row*this.rowSize)+ani.length };
      let frms = this.scene.anims.generateFrameNumbers(this.key, frm_spec );

      this.scene.anims.create({
        key: ani.name + "_" + this.key,
        frames: frms,
        frameRate: 10,
        repeat: (ani.name == 'lpc_dead') ? 0 : -1
      });      
    });

    this.grp = this.scene.physics.add.group();
    this.obj = this.grp.create(-256, -256, this.key);
  }

  update () {
    super.update();
    if (this.ani != this.last_ani) {
      this.last_ani = this.ani;

      if (this.ani.length > 0) {
        this.obj.play(this.ani);   
      } else {
        this.obj.stop(0);
      }
    }
  }

  refreshLoc () {
    super.refreshLoc();
    let loc = this.getLoc();
    if (this.obj) {
      this.obj.setPosition(loc.x, loc.y);
    }
  }
}

/* LpcSprite - Assuming a spritesheet compliant to
 * the Universal Liberated Pixel Cup standard,
 * generate all needed animation sequences for that
 * sprite.
 * 
 * LPC sprites are generated from:
 *   https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/
 *
 * The spritesheet may have a width of 13 or 24 tiles, depending on
 * what accessories the sprite uses.  This class does not autodetect this (yet).
 * In this case, set the isLargeSpritesheet property.
 */
class LpcSprite extends SpriteBasic {
  constructor (parent, key, spritesheet_fn, x, y) {
    super(parent, key, spritesheet_fn, x, y);
    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.isLargeSpritesheet = false;
  }
  
  preload() {
    let row_width = (this.isLargeSpritesheet) ? 24 : 13;
    super.preload(64,64, row_width);
  }

  create () {
    let aniList = [
      /* Spell Casting Animations */
      { name: 'lpc_cast_up', row: 0, length: 6 },
      { name: 'lpc_cast_left', row: 1, length: 6 },
      { name: 'lpc_cast_down', row: 2, length: 6 },
      { name: 'lpc_cast_right', row: 3, length: 6 },

      /* Poke */
      { name: 'lpc_stab_up', row: 4, length: 7 },
      { name: 'lpc_stab_left', row: 5, length: 7 },
      { name: 'lpc_stab_down', row: 6, length: 7 },
      { name: 'lpc_stab_right', row: 7, length: 7 },

      /* Walk Cycles */
      { name: 'lpc_walk_up', row: 8, length: 8 },
      { name: 'lpc_walk_left', row: 9, length: 8 },
      { name: 'lpc_walk_down', row: 10, length: 8 },
      { name: 'lpc_walk_right', row: 11, length: 8 },

      /* Slash */
      { name: 'lpc_slash_up', row: 12, length: 5 },
      { name: 'lpc_slash_left', row: 13, length: 5 },
      { name: 'lpc_slash_down', row: 14, length: 5 },
      { name: 'lpc_slash_right', row: 15, length: 5 },

      /* Shoot */
      { name: 'lpc_shoot_up', row: 16, length: 12 },
      { name: 'lpc_shoot_left', row: 17, length: 12 },
      { name: 'lpc_shoot_down', row: 18, length: 12 },
      { name: 'lpc_shoot_right', row: 19, length: 12 },

      /* Dead */
      { name: 'lpc_dead', row: 20, length: 5 }

    ];

    super.create(aniList);

    this.obj.setScale(3.0);
    //this.obj.body.setSize(24,24).setOffset(20,40);
    this.obj.body.setCircle(12).setOffset(16+2, 32+16);
    this.obj.setCollideWorldBounds(true);

    this.ani = 'lpc_walk_down' + "_" + this.key;
  }

  playAni(ani) {
    this.ani = ani + this.key;
  }
}
