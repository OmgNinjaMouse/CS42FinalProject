
class Bumper extends RelocatableObject {
  constructor (scene, x, y) {
    super(scene, x, y);
    this.reset = this.reset.bind(this);
    this.init = this.init.bind(this);
    this.bump = this.bump.bind(this);

    let loc = this.getLoc();
    this.start_x = loc.x;
    this.start_y = loc.y;
    this.radius = 14;
    this.max = this.radius + 8;
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
