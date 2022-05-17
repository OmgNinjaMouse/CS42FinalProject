

class SlingshotLeft extends RelocatableObject {
  constructor (parent, x, y) {
    super(parent, x, y);
    this.bump = this.bump.bind(this);
    this.debounce_ms = 250;
   
    this.trigger_width = 40;
    this.trigger_depth = 4;
    this.trigger_offset = { x:16, y:-9 };
    this.trigger_angle = 55;
   
    this.hammer_extends = 5;
    this.hammer_multi = 2;
 
    this.anchor_offset = { x: 5, y: -2 };
    this.actuator_offset = { x: 15, y: -7};

    this.key = "slingleft";
    this.image_fn = "./sprites/slingshot.png";
    this.shape_fn = "./sprites/slingshot.json";
  }

  init () {
    this.last_bump = Date.now();
    this.debounce = false;
  }

  preload () {
    this.scene.load.image(this.key, this.image_fn);
    this.scene.load.json(this.key + "_trace", this.shape_fn);
    this.scene.load.audio("sling", "./sounds/lokif_gui/misc_menu_3.wav");

  }

  create () {
    let loc = this.getLoc();

    /* The Frame Object is the triangular outline of the slingshot object */
    this.frame_img = this.scene.add.image(loc.x, loc.y, this.key);
    this.scene.add.existing(this.frame_img);
    this.frame_obj = this.scene.matter.add.gameObject(this.frame_img);

    let shapes = this.scene.cache.json.get(this.key + '_trace');
    this.frame_obj.setBody(shapes["slingshot"], {});
    this.frame_obj.setStatic(true);
    this.frame_obj.setScale(0.2);

    /* The slingshot has a sensor on the long edge that triggers the action */
    this.trigger_box =  this.scene.add.rectangle(loc.x+this.trigger_offset.x, loc.y+this.trigger_offset.y, 
                                                 this.trigger_width, this.trigger_depth, 0xaa0000);
    this.trigger_obj = this.scene.matter.add.gameObject(this.trigger_box);
    this.trigger_obj.angle = this.trigger_angle;
    this.trigger_obj.setStatic(true);
    this.trigger_obj.setSensor(true);
    this.trigger_obj.setVisible(false);
    this.trigger_obj.setOnCollide( (pair) => {
      this.bump();
    })

    /* the hammer is the part that actually moves and contacts the ball.  It's slightly bigger
     * than the sensor to avoid catching the corners.
    */
    this.hammer_box =  this.scene.add.rectangle(loc.x+this.trigger_offset.x-this.trigger_depth, 
                                                 loc.y+this.trigger_offset.y+this.trigger_depth, 
                                                 this.trigger_width+this.hammer_extends, this.trigger_depth*this.hammer_multi, 0xaa0000);
    this.hammer_obj = this.scene.matter.add.gameObject(this.hammer_box);
    this.hammer_obj.angle = this.trigger_angle;
    this.hammer_obj.setFixedRotation();
    this.hammer_obj.setCollidesWith([cCollisionBall]);
    this.hammer_obj.setMass(4);
    this.hammer_obj.setVisible(false);

    /* The Anchor is a strong tie pulling back the hammer away from the surface of the object */
    this.anchor = this.scene.matter.add.image(
      loc.x+this.anchor_offset.x, loc.y+this.anchor_offset.y, null, null, 
      { isSensor: true, isStatic: true }
    ).setVisible(false);
    
    /* the reset Pin is the force connecting the hammer to the anchor, pulling back
     * the slingshot
     */
    /* let deboucne set this */
    this.resetPin = null;
    this.debounce = true;
    this.last_bump = Date.now();

    /* The actuator is the point that the hammer is pulled toward when active */
    this.actuator = this.scene.matter.add.image(
      loc.x+this.actuator_offset.x, loc.y+this.actuator_offset.y, null, null, 
      { isSensor: true, isStatic: true }
    ).setVisible(false);

    /* The spring constraint applies the force onto the hammer */
    this.spring = this.scene.matter.add.constraint(this.hammer_obj, this.actuator, 0, 0.6);

    /* Sound effect */
    this.sfx = [
      this.scene.sound.add("sling")
    ]
  }

  bump () {
    this.scene.matter.world.removeConstraint(this.resetPin);
    this.debounce = true;
    this.last_bump = Date.now();
    this.sfx[Math.floor(Math.random() * this.sfx.length)].play();
  }

  update () {
    super.update();
    let now = Date.now();
    if (this.debounce) {
      if (now > (this.last_bump+this.debounce_ms)) {
        this.debounce = false;
        this.resetPin = this.scene.matter.add.constraint(this.hammer_obj, this.anchor, 0, 1);
      }
    }
  }
}

class SlingshotRight extends SlingshotLeft {
  constructor (parent, x, y) {
    super(parent, x, y);

    this.trigger_offset = { x:-16, y:-9 };
    this.trigger_angle = -55;
    this.anchor_offset = { x: -5, y: -2 };
    this.actuator_offset = { x: -15, y: -7};

    this.key = "slingright";
    this.image_fn = "./sprites/slingshot_r.png";
    this.shape_fn = "./sprites/slingshot_r.json";
  }

}