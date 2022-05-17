
class BumpTargetLeft extends RelocatableObject {
  constructor (parent, x, y, gid) {
    super(parent, x, y);
    this.ignite = this.ignite.bind(this);
    this.reset = this.reset.bind(this);
    this.bump_debounce = 200;
    this.gid = gid;

    this.marker_offset = { x: 20, y: 0 };
    this.actuator_offset = { x: 15, y: 0 };
    this.angle = 0;
  }

  init () {
    this.lit = false;
    this.debounce = false;
    this.last_bump = Date.now();
  }

  preload () {
    super.preload();
    this.scene.load.image("target_dark", "./sprites/target_dark.png");
    this.scene.load.image("target_lit", "./sprites/target_lit.png");

    this.scene.load.image("rollover_dark", "./sprites/rollover_dark.png");
    this.scene.load.image("rollover_lit", "./sprites/rollover_lit.png");
    this.scene.load.audio("target", "./sounds/lokif_gui/sharp_echo.wav");

  }

  create () {
    super.create();

    /* Target Object */
    let loc = this.getLoc();
    this.target_img = this.scene.add.image(loc.x, loc.y, "target_dark");
    this.target_obj = this.scene.matter.add.gameObject(this.target_img);
    this.target_obj.setFixedRotation();
    this.target_obj.setCollidesWith([cCollisionBall]);
    this.target_obj.setBounce(1.2);
    this.target_obj.setMass(1);
    this.target_obj.angle = this.angle;
    //this.target_obj.setStatic(true);

    /* Actuator */
    this.actuator = this.scene.matter.add.image(
      loc.x, loc.y,
      null, null,
      { isSensor: true, isStatic: true }
    ).setVisible(false);
    this.scene.matter.add.constraint(this.target_obj, this.actuator, 0, 0.3);

    /* Hit Indicator */
    this.circle = this.scene.add.image(
      loc.x+this.marker_offset.x, 
      loc.y+this.marker_offset.y, 
      "rollover_dark"
    );
    this.scene.add.existing(this.circle);
    this.marker = this.scene.matter.add.gameObject(this.circle).setCircle(this.radius);
    this.marker.setSensor(true);
    this.marker.setStatic(true);

    /* Collision detection */
    this.target_obj.setOnCollide((pair) => {
      this.ignite();
    });

    /* Group Interface */
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
    this.target_obj.setTexture("target_lit");
    this.sfx[Math.floor(Math.random() * this.sfx.length)].play();
    this.notify({type: "score", source:"target"});

    this.last_bump = Date.now();
    let loc = this.getLoc();

    if (this.debounce == false) {
      this.scene.tweens.add({
        targets: [this.actuator],
        x: loc.x+this.actuator_offset.x,
        y: loc.y+this.actuator_offset.y,
        yoyo: true,
        duration: 30
      })
    }

    this.debounce = true;

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
    let now = Date.now();
    if ((this.debounce) && (now > this.last_bump+this.bump_debounce)) {
      this.debounce = false;
      this.target_obj.setTexture("target_dark");
    }

  }
}

class BumpTargetRight extends BumpTargetLeft {
  constructor (parent, x, y, gid) {
    super(parent, x, y, gid);
    
    this.marker_offset = { x: -20, y: 0 };
    this.actuator_offset = { x: -15, y: 0 };
    this.angle = 180;
  }
}

class BumpTargetTop extends BumpTargetLeft {
  constructor (parent, x, y, gid) {
    super(parent, x, y, gid);
    
    this.marker_offset = { x: 0, y: 20 };
    this.actuator_offset = { x: 0, y: 15 };
    this.angle = 90;
  }
}

class BumpTargetBottom extends BumpTargetLeft {
  constructor (parent, x, y, gid) {
    super(parent, x, y, gid);
    
    this.marker_offset = { x: 0, y: -20 };
    this.actuator_offset = { x: 0, y: -15 };
    this.angle = 270;
  }
}