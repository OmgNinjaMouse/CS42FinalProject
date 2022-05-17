

class Rollover extends RelocatableObject {
  constructor (parent, x, y, gid ) {
    super(parent, x, y);
    this.gid = gid;
  }

  init () {
    super.init();
    this.lit = false;
    this.radius = 8;
  }

  preload () {
    super.preload();
    this.scene.load.image("rollover_dark", "./sprites/rollover_dark.png");
    this.scene.load.image("rollover_lit", "./sprites/rollover_lit.png");
    this.scene.load.audio("rollover", "./sounds/lokif_gui/misc_menu_2.wav");

  }

  create () {
    super.create();
    
    let loc = this.getLoc();
    this.circle = this.scene.add.image(loc.x, loc.y, "rollover_dark");
    this.scene.add.existing(this.circle);

    this.marker = this.scene.matter.add.gameObject(this.circle).setCircle(this.radius);
    this.marker.setSensor(true);
    this.marker.setStatic(true);
    this.marker.setCollidesWith([cCollisionBall]);

    this.marker.setOnCollide((pair) => {
      this.ignite();
    });

    this.scene.q(ControlEvents.REGISTER_GROUP, { grp: this.gid, id: this.obj_key });
    this.listen(ControlEvents.GROUP_COMPLETE, (event, data) => {
      if (data.grp == this.gid) {
        this.reset();
      }
    });

    this.sfx = [
      this.scene.sound.add("rollover")
    ]
  }

  ignite () {
    this.sfx[Math.floor(Math.random() * this.sfx.length)].play();

    if (this.lit == false) {
      this.lit = true;
      this.marker.setTexture("rollover_lit");
      this.scene.q(ControlEvents.GROUP_UPDATE, { grp: this.gid, id: this.obj_key });
    }
  }

  reset () {
    this.lit = false;
    this.marker.setTexture("rollover_dark");
    this.scene.q(ControlEvents.GROUP_CLEAR, { grp: this.gid, id: this.obj_key });
  }

  update () {
    super.update();
  }
}