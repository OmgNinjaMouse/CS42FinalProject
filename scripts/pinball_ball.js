
class BallV2 extends RelocatableObject {
  constructor (scene, x, y) {
    super(scene, x, y);
    this.reset = this.reset.bind(this);
    this.setKey = this.setKey.bind(this);
    let loc = this.getLoc();
    this.start_x = loc.x;
    this.start_y = loc.y;
    this.radius = 12;
  }

  reset () {
    console.log("Resetting ball.");
    this.ball.setPosition(this.start_x, this.start_y);
    this.ball.setVelocity(0,0);
  }

  getPosition () {
    return {x: this.ball.x, y: this.ball.y };
  }

  preload () {
    super.preload();
    this.scene.load.image("ball", "./sprites/ball.png");
  }

  create () {
    super.create();
    //this.circle = this.scene.add.circle(this.start_x, this.start_y, this.radius, 0xff0000);
    //this.scene.add.existing(this.circle);

    this.circle = this.scene.add.image(this.start_x, this.start_y, "ball");
    this.circle.setScale(0.25);
    this.ball = this.scene.matter.add.gameObject(this.circle).setCircle(this.radius);
    this.ball.setCollisionCategory(cCollisionBall)
    this.ball.setMass(0.6);
    this.ball.setBounce(0.8);
    this.ball.body._pinball_key = this.key;

    this.listen(ControlEvents.ABORT, () => this.reset());
    this.listen(ControlEvents.LEFT_TILT, () => {
      this.ball.setVelocityX(this.ball.body.velocity.x + 5);
    })
    this.listen(ControlEvents.RIGHT_TILT, () => {
      this.ball.setVelocityX(this.ball.body.velocity.x - 5);
    })

    return this;
  }

  update () {
    super.update();
  }

  refreshLoc () {
    let loc = this.getLoc();
    if (this.ball) {
      this.ball.setPosition(loc.x, loc.y);
    }
  }

  setKey (key) {
    this.key = key;
  }
}