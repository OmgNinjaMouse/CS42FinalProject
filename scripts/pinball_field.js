const cCollisionSparks = 0x1;
const cCollisionBall = 0x2;
const cCollisionObjects = 0x4;
const cCollisionWorld = 0x8;
const cCollisionFlipper = 0x10;


class FieldBorder extends RelocatableObject {
  constructor(parent, x, y, width, height) {
    super(parent, x, y);
    this.setCollisionCb = this.setCollisionCb.bind(this);
    this.border_width = width;
    this.border_height = height;
    this.callback = null;
  }

  create () {
    super.create();
    let loc = this.getLoc();
    this.rail_mdl = this.scene.add.rectangle(loc.x, loc.y, this.border_width, this.border_height, 0xaa0000);
    this.scene.add.existing(this.rail_mdl);
    this.rail_obj = this.scene.matter.add.gameObject(this.rail_mdl);
    this.rail_obj.setStatic(true);

    this.rail_obj.setOnCollide((pair) => {
      if (this.callback) {
        this.callback(pair);
      }
    });
  }

  refreshLoc () {
    super.refreshLoc();
    let loc = this.getLoc();
    if (this.rail_obj != undefined) {
      try {
        this.rail_obj.setPosition(loc.x, loc.y);
      } catch (e) {
        console.log("Error on refresh for rail border?");
      }

    }
  }

  setCollisionCb (callback) {
    this.callback = callback;
  }

}

class PinballField extends RelocatableObject {
  constructor(parent, x, y, width, height) {
    super(parent, x, y);
    this.width = width;
    this.height = height;
    this.border_size = 25;


    this.addObject("frame_top", new FieldBorder(this, this.width/2, 0, this.width, this.border_size));
    this.addObject("frame_btm", new FieldBorder(this, this.width/2, this.height, this.width, this.border_size));
    this.addObject("frame_lft", new FieldBorder(this, 0, this.height/2, this.border_size, this.height));
    this.addObject("frame_rgt", new FieldBorder(this, this.width, this.height/2, this.border_size, this.height));
    this.addObject("group_mgr", new GroupManager(this, 0, 0));

    this.objects.frame_btm.setCollisionCb((pair) => {
      
      let key = pair.bodyB._pinball_key;
      if (key != undefined) {
        console.log("Deadball " + key);
        this.objects[key].reset();
      }
    });
  }

  init () {
    this.balls = [];

    let level_mdl = getModel().game_ctx.level;
    level_mdl.ball.forEach( (spec, idx) => {
      let obj = this.addObject("ball_"+idx, new BallV2(this, spec.x, spec.y));
      obj.setKey("ball_"+idx);
      this.balls.push(obj);
    });
    level_mdl.launcher.forEach( (spec, idx) => {
      this.addObject("launch_" + idx, new Launcher(this, spec.x, spec.y));
    });
    level_mdl.flippers.forEach( (spec, idx) => {
      this.addObject("flip_"+idx, new FlipperV2(this, spec.x, spec.y, (spec.dir == "right")));
    });
    level_mdl.rails.forEach( (spec, idx) => {
      this.addObject("rail_"+idx, new WireRailV2(this, spec.x1, spec.y1, spec.x2, spec.y2));
    });
    level_mdl.wires.forEach( (spec, idx) => {
      this.addObject("wire_"+idx, new Wire(this, spec.x1, spec.y1, spec.x2, spec.y2));
    });
    level_mdl.bumpers.forEach( (spec, idx) => {
      this.addObject("bump_"+idx, new Bumper(this, spec.x, spec.y));
    });
    level_mdl.rollover.forEach( (spec, idx) => {
      this.addObject("roll_"+idx, new Rollover(this, spec.x, spec.y, spec.gid));
    });
    level_mdl.slingshot.forEach( (spec, idx) => {
      let key = "sling_"+idx;
      if (spec.dir == "right") {
        this.addObject(key, new SlingshotRight(this, spec.x, spec.y));
      } else {
        this.addObject(key, new SlingshotLeft(this, spec.x, spec.y));
      }
    });
    level_mdl.targets.forEach( (spec, idx) => {
      switch (spec.dir) {
        case "left":
          this.addObject("target_"+idx, new BumpTargetLeft(this, spec.x, spec.y, spec.gid));
          break;
        case "right":
          this.addObject("target_"+idx, new BumpTargetRight(this, spec.x, spec.y, spec.gid));
          break;
        case "top":
          this.addObject("target_"+idx, new BumpTargetTop(this, spec.x, spec.y, spec.gid));
          break;
        case "bottom":
          this.addObject("target_"+idx, new BumpTargetBottom(this, spec.x, spec.y, spec.gid));
          break;
      }
    });

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

    /* Checking for out of bounds condiitons */
    this.balls.forEach( (ball) => {
      let loc = ball.getPosition();
      if ((loc.x < this.x) || (loc.x > this.x+this.width)) {
        ball.reset();
      }
      if ((loc.y < this.y) || (loc.y > this.y+this.height)) {
        ball.reset();
      }
    });
  }

}