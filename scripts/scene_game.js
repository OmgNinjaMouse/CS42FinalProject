

const cCollisionSparks = 0x1;
const cCollisionBall = 0x2;
const cCollisionObjects = 0x4;
const cCollisionWorld = 0x8;
const cCollisionFlipper = 0x10;



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
                debug: true,
                positionIterations:12,
                showPerformance: true
            }
        }

    }
    super(config);

    this.addObject("ball", new Ball(this, 925, 910));
    this.addObject("left_flip", new Flipper(this, 420, 970, false));
    this.addObject("right_flip", new Flipper(this, 600, 970, true));
    this.addObject("left_wire", new WireRail(this, 0, 900, 400, 960));
    this.addObject("right_wire", new WireRail(this, 620, 960, 890, 900));
    this.addObject("right_vert", new WireRail(this, 890, 800, 890, 900));

    this.addObject("top_left", new WireRail(this, 0, 100, 480, 0));
    this.addObject("top_right", new WireRail(this, 940, 100, 480, 0));


    this.addObject("bumper_a", new Bumper(this, 490, 400));
    this.addObject("bumper_b", new Bumper(this, 590, 350));
    this.addObject("bumper_c", new Bumper(this, 390, 350));

    this.addObject("bumper_d", new Bumper(this, 290, 450));
    this.addObject("bumper_e", new Bumper(this, 390, 500));
    this.addObject("bumper_f", new Bumper(this, 190, 500));

    this.addObject("bumper_g", new Bumper(this, 690, 450));
    this.addObject("bumper_h", new Bumper(this, 790, 500));
    this.addObject("bumper_i", new Bumper(this, 590, 500));

    this.addObject("launch", new Launcher(this, 930, 930));

    this.addObject("bgm", new BgmAgent(this));
  }
  
  preload () {
    super.preload();
  }

  create () {
    super.create();

    let bgm_name = "battle_" + Math.floor(Math.random() * 4);
    this.objects.bgm.play(bgm_name);

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
        case "KeyZ":
          this.objects["left_flip"].flip(true);
          break;

        case "Slash":
          this.objects["right_flip"].flip(true);
          break;

        case "Space":
          //this.objects["ball"].reset();
          this.objects["launch"].pull();
          break;

        default:
          console.log(event.code);
          break;
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      switch (event.code) {
        case "KeyZ":
          this.objects["left_flip"].flip(false);
          break;
        case "Slash":
          this.objects["right_flip"].flip(false);
          break;
        case "Space":
          this.objects["launch"].release();
          break;
      }
    });
  }

  update () {
    super.update();
    let pos = this.objects.ball.getPosition();
    if (pos.y > 540*2) {
      console.log("Ball has left play!");
      this.scene.start("SceneContinue");

    }

    if (pos.y < 0) {
      /* Somehow the ball launched through the ceiling. :) */
      this.objects.ball.reset();
    }
  }
}
