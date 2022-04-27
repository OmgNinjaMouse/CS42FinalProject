

const cCollisionSparks = 0x1;
const cCollisionBall = 0x2;
const cCollisionObjects = 0x4;
const cCollisionWorld = 0x8;

class ShinySpec extends BasicObject {
  constructor (scene) {
    super(scene);

  }

  preload () {
    super.preload();
    this.scene.load.image('blue', 'sprites/blue.png');
    return this;
  }

  create () {
    super.create();
    this.obj = this.scene.matter.add.image(
      Phaser.Math.Between(0, 960),
      Phaser.Math.Between(0, 540*2),
      'blue', null,
      { shape: { type: 'polygon', radius: 9 } 
      }
    );

    this.obj.resetPoint = { x: this.obj.x, y: this.obj.y };
    this.obj.setScale(0.8);
    this.obj.setBlendMode('ADD');
    this.obj.setFriction(0.005);
    this.obj.setBounce(0.8);
    this.obj.setMass(0.01);
    this.obj.setOrigin(0.5);
    //this.obj.setTint(0x880088);
    this.obj.body.ignoreGravity = true;
    this.obj.setCollisionCategory(cCollisionSparks);
    this.obj.setCollidesWith([cCollisionBall]);
    return this;
  }

  update () {
    super.update();
    let vx = this.obj.body.velocity.x;
    let vy = this.obj.body.velocity.y;
    let v = Math.sqrt( Math.pow(vx, 2) + Math.pow(vy, 2));
    let val = 0xff * Math.min( (v/3), 1);
    this.obj.setTint( (val << 16) + (val));

    if (v < 0.01) {
      this.obj.setPosition(this.obj.resetPoint.x, this.obj.resetPoint.y);
    }
    return this;
  }
}

class ParticleField extends BasicObject {
  constructor (scene) {
    super(scene);
    this.addObject("spec_proto", new ShinySpec(this.scene))
  }

  create () {
    super.create();
    for (let i=0; i<250; i++) {
      let obj = this.addObject("spec"+i, new ShinySpec(this.scene));
      obj.init().preload().create();
    }
    return this;
  }
}

class Block extends BasicObject {
  constructor (scene) {
    super(scene);
  }

  preload () {
    this.scene.load.image('block', 'sprites/block.png');
    return this;
  }

  create () {
    this.scene.matter.add.image(600, 0, 'block').setBounce(0.8).setMass(60);
    return this;
  }

}

class Ball extends BasicObject {
  constructor (scene) {
    super(scene);
    this.reset = this.reset.bind(this);
    this.start_x = 432;
    this.start_y = 0;
  }

  reset () {
    this.ball.setPosition(this.start_x, this.start_y);
    this.ball.setVelocity(0,0);
  }

  create () {
    super.create();

    this.circle = this.scene.add.circle(this.start_x, this.start_y, 16, 0xff0000);
    this.scene.add.existing(this.circle);
    this.ball = this.scene.matter.add.gameObject(this.circle).setCircle(16);
    this.ball.setMass(1);
    this.ball.setBounce(0.8);
    this.ball.setCollisionCategory(cCollisionBall);
    this.ball.setCollidesWith([cCollisionSparks, cCollisionObjects, cCollisionWorld]);

    this.scene.cameras.main.startFollow(this.ball);
    return this;
  }
}


class Flipper extends BasicObject {
  constructor (scene, x, y, is_right){
    super(scene);

    this.x = x;
    this.y = y;
    this.isRight = is_right;
    this.flip = this.flip.bind(this);
  }

  init () {
    super.init();
    this.height = 32;
    this.width = 112;

    this.lever_sz = 64;
    this.min = Phaser.Math.DegToRad(32);
    this.max = Phaser.Math.DegToRad(-15);

    this.tweener = {
      x: this.min
    }
    return this;
  }

  /* Flip is what actually moves the actuator.  
   * A tween increments "tweener" as it runs to completion.
   * Flip translates the tweeners position into rotational position,
   *      and then applies it to the actuator.
   * Since the actuator is constrained to the flipper body, 
   * the flipper moves as a result.
   */
  flip (isDown) {
    let x_flip = (this.isRight) ? -1 : 1;
    this.scene.tweens.add({
      targets: [this.tweener],
      x: isDown ? this.max : this.min,
      duration: 50,
      onUpdateScope: this,
      onUpdate: () => {
        this.lever.setPosition(
          this.x - Math.cos(this.tweener.x) * this.lever_sz * x_flip,
          this.y - Math.sin(this.tweener.x) * this.lever_sz
        )
      }
    });
  }

  create () {
    super.create();

    /* Create the actual body of the flipper */
    var rectangle = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0x0000ff);
    this.scene.add.existing(rectangle);
    this.body = this.scene.matter.add.gameObject(rectangle, {
      friction: 1
    });
    this.body.setMass(5);
    this.body.setCollisionCategory(cCollisionObjects);
    this.body.setCollidesWith(cCollisionBall);

    /* Connect the flipper to the game world background */
    /*   Params:  Connected to flipper body, joint length zero, very stiff */
    /*   PointA:  Location in the world where the joint exists. */
    /*   PointB:  Offset from the center of the flipper where the flipper body connects to Point A */
    let x_offset = (this.width - this.height) / 2;
    x_offset = x_offset * ((this.isRight) ? -1 : 1);

    this.scene.matter.add.worldConstraint(this.body, 0, 1, 
                                         {
                                           pointA: new Phaser.Math.Vector2(this.x, this.y), 
                                           pointB: new Phaser.Math.Vector2(x_offset, 0)   /* From the center of the flipper, offset to one side */
                                         });

    /* A second invisible object acts as the actuator moving the Flipper Body */
    /* Since this is a rotational actuator, cos/sin is used to find it's resting spot */
    /* tweener acts as the state of the actuator within it's range of motion */
    /* "Sensor" means that phaser detects collisions, but doesn't use the object as a collision body */
    let x_flip = (this.isRight) ? -1 : 1;
    this.lever = this.scene.matter.add.image(
      this.x - Math.cos(this.tweener.x) * this.lever_sz * x_flip,
      this.y - Math.sin(this.tweener.x) * this.lever_sz,
      null,
      null,
      {
        isSensor: true,
        isStatic: true
      }
    ).setVisible(false);

    /* The actuator is connected to the flipper body here. 
     *   The 0.1 used for stiffness essentially creates a spring connection between the two points 
     *   PointA is the offset from the center of the body where the connection is made
     *   PointB refers to center of the actuator
     */
    let lever_offset = (this.width - this.height) / 2 + this.lever_sz;
    lever_offset = lever_offset * ((this.isRight) ? -1 : 1);
    this.scene.matter.add.constraint(this.body, this.lever.body, 0, 0.1, {
      pointA: new Phaser.Math.Vector2(lever_offset, 0),
      pointB: new Phaser.Math.Vector2()
    });

    return this;
  }
}

class WireRail extends BasicObject {
  constructor (scene, x1, y1, x2, y2) {
    super (scene);
    this.start_loc = { x: x1, y: y1 };
    this.end_loc = { x: x2, y: y2 };
    this.midpt = { x: (x1+x2) / 2, y: (y1+y2) / 2 };
    this.angle_rad = Math.atan2( y2-y1, x2-x1 );
    this.length = Math.sqrt( Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    this.thickness = 10;
  }

  create () {
    super.create();
    this.start_post_mdl = this.scene.add.circle(this.start_loc.x, this.start_loc.y, this.thickness, 0x333333);
    this.scene.add.existing(this.start_post_mdl);
    this.start_obj = this.scene.matter.add.gameObject(this.start_post_mdl).setCircle(this.thickness);
    this.start_obj.setStatic(true);
    this.start_obj.setBounce(0.8);

    this.end_post_mdl = this.scene.add.circle(this.end_loc.x, this.end_loc.y, this.thickness, 0x333333);
    this.scene.add.existing(this.end_post_mdl);
    this.end_obj = this.scene.matter.add.gameObject(this.end_post_mdl).setCircle(this.thickness);
    this.end_obj.setStatic(true);
    this.end_obj.setBounce(0.8);

    this.rail_mdl = this.scene.add.rectangle(this.midpt.x, this.midpt.y, this.length, this.thickness*2, 0x333333);
    this.scene.add.existing(this.rail_mdl);
    this.rail_obj = this.scene.matter.add.gameObject(this.rail_mdl);
    this.rail_obj.setStatic(true);
    this.rail_obj.setBounce(0.8);
    this.rail_obj.rotation = this.angle_rad;
    this.rail_obj.setFriction(0);
    this.rail_obj.setCollisionCategory(cCollisionObjects);
    this.rail_obj.setCollidesWith(cCollisionBall);

    return this;
  }
}

class Bumper extends BasicObject {
  constructor (scene, x, y) {
    super(scene);
    this.reset = this.reset.bind(this);
    this.init = this.init.bind(this);
    this.bump = this.bump.bind(this);

    this.start_x = x;
    this.start_y = y;
    this.radius = 32;
    this.max = this.radius + 16;
    this.base_color = 0x00ff00;
    this.bump_color = 0xff00ff;
  }

  init () {
    super.init();
    this.tweener = {
      x: this.radius
    }
  }

  bump () {
    this.scene.tweens.add({
      targets: [this.tweener],
      x: this.max,
      duration: 25,
      onUpdateScope: this,
      yoyo: true,
      onUpdate: () => {
        //this.ball.radius = this.tweener.x;
        this.circle.radius = this.tweener.x;
        this.ball.setBody(this.circle);
        let blend_factor = (this.tweener.x - this.radius) / (this.max - this.radius);
        let blend_color = ((this.bump_color - this.base_color) * blend_factor) + this.base_color;
        this.circle.fillColor = blend_color;
      }
    })
  }

  reset () {
    this.ball.setPosition(this.start_x, this.start_y);
    this.ball.setVelocity(0,0);
  }

  create () {
    super.create();

    this.circle = this.scene.add.circle(this.start_x, this.start_y, this.radius, 0x00ff00);
    this.scene.add.existing(this.circle);
    this.ball = this.scene.matter.add.gameObject(this.circle).setCircle(this.radius);
    this.ball.setBounce(2.8);
    this.ball.body.restitution = 2.8;
    this.ball.setStatic(true);
    this.ball.setCollisionCategory(cCollisionObjects);
    this.ball.setCollidesWith(cCollisionBall);
    this.ball.setOnCollide( (pair) => {
      console.log("Bumper Hit!");
      this.bump();
    });
    return this;
  }
}

class SceneGame extends BasicScene {
  constructor () {
    let config = {
        key: "SceneGame",
        physics: {
            default: 'matter',
            matter: {
                debug: false
            }
        }

    }
    super(config);

    //this.addObject("bgm", new BgmSampled(this));
    this.addObject("field", new ParticleField(this));
    //this.addObject("block", new Block(this));
    this.addObject("ball", new Ball(this));
    this.addObject("left_flip", new Flipper(this, 400, 990, false));
    this.addObject("right_flip", new Flipper(this, 620, 990, true));
    this.addObject("left_wire", new WireRail(this, 0, 900, 400, 960));
    this.addObject("right_wire", new WireRail(this, 620, 960, 960, 900));
    this.addObject("bumper_a", new Bumper(this, 490, 400));
    this.addObject("bumper_b", new Bumper(this, 590, 350));
    this.addObject("bumper_c", new Bumper(this, 390, 350));

    this.addObject("bumper_d", new Bumper(this, 290, 450));
    this.addObject("bumper_e", new Bumper(this, 390, 500));
    this.addObject("bumper_f", new Bumper(this, 190, 500));

    this.addObject("bumper_g", new Bumper(this, 690, 450));
    this.addObject("bumper_h", new Bumper(this, 790, 500));
    this.addObject("bumper_i", new Bumper(this, 590, 500));


  }
  
  preload () {
    super.preload();
  }

  create () {
    super.create();
    this.matter.world.setBounds(0,0,960, 540*2, 64, true, true, true, false);

    [ this.matter.world.walls.left,
      this.matter.world.walls.right,
      this.matter.world.walls.top
    ].forEach( wall => {
      wall.collisionFilter.category = cCollisionWorld;
      wall.collisionFilter.mask = cCollisionBall | cCollisionSparks;
    });

    this.cameras.main.setBounds(0, 0, 960, 540*2);

    //this.objects["bgm"].toggleBgm(true);

    //this.matter.add.mouseSpring();
    this.input.keyboard.on('keydown', (event) => {
      //this.objects["bgm"].toggleBgm(true);
      switch (event.code) {
        case "ShiftLeft":
          this.objects["left_flip"].flip(true);
          break;

        case "ShiftRight":
          this.objects["right_flip"].flip(true);
          break;

        case "Space":
          this.objects["ball"].reset();
          break;

        default:
          console.log(event.code);
          break;
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      switch (event.code) {
        case "ShiftLeft":
          this.objects["left_flip"].flip(false);
          break;
        case "ShiftRight":
          this.objects["right_flip"].flip(false);
          break;
      }
    });

  }
}
