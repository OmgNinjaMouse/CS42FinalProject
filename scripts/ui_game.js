
class CharacterStage extends RelocatableObject {
  constructor(parent, x, y, width) {
    super(parent, x,y);
    this.width = width;
    this.last_left_health = 200;
    this.last_right_health = 200;
    this.current_left_health = 200;
    this.current_right_health = 200;
  }

  init() {
    let char_mdl = getModel().game_ctx.players;
    this.addObject("left_char", new LpcSprite(this, char_mdl[0].key, char_mdl[0].spritesheet, 0, 0));
    this.addObject("right_char", new LpcSprite(this, char_mdl[1].key, char_mdl[1].spritesheet, this.width-64, 0));

  }

  refreshLoc () {
    super.refreshLoc();
  }

  create () {
    super.create();
    this.refreshLoc();
  }

  setHealth(left_health, right_health) {
    this.current_left_health = left_health;
    this.current_right_health = right_health;
  }

  update () {
    super.update();
    this.objects.left_char.playAni('lpc_walk_down');
    this.objects.right_char.playAni('lpc_walk_down');
    /* Every 1 sec, perform a DPS check */
    /* Pick animation based on DPS */
    /*    weak */
    /*    medium */
    /*    heavy */

    /* Effects sprites? */
  }
}


class HealthBar extends RelocatableObject {
  constructor(parent, x, y, width) {
    super(parent, x, y);
    this.justify = this.justify.bind(this);
    this.setHealth = this.setHealth.bind(this);

    console.log("Width:" + width);
    this.width = width;
    this.height = 30;
    this.health = 200;
    this.max_health = 200;
  }

  init () {
    super.init();
    this.is_right = false;
  }

  create () {
    let loc = this.getLoc();
    this.background = this.scene.add.rectangle(loc.x, loc.y, this.width, this.height, 0x333366);
    this.scene.add.existing(this.background);
    this.background.setOrigin(0, 0.5);      

    this.foreground = this.scene.add.rectangle(loc.x, loc.y, (this.width*0.95)*(this.health/this.max_health), this.height*0.8, 0x116633);
    this.scene.add.existing(this.foreground);
    this.foreground.setOrigin(0, 0.5);
  }

  justify (is_right) {
    this.is_right = is_right;
    if (this.is_right) {
      this.background.setOrigin(1, 0.5);
      this.foreground.setOrigin(1, 0.5);
    } else {
      this.background.setOrigin(0, 0.5);      
      this.foreground.setOrigin(0, 0.5);
    }
  }

  setHealth (health) {
    this.health = health;
    this.foreground.setSize((this.width*0.95)*(this.health/this.max_health), this.height*0.8);

    if ((this.health/this.max_health) < 0.25) {
      this.foreground.setFillStyle(0x663333, 1);
    }
    else if ((this.health/this.max_health) < 0.5) {
      this.foreground.setFillStyle(0x666633, 1);
    }
    this.justify(this.is_right);
  }
}
