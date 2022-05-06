
class Ball extends BasicObject {
  constructor (scene, x, y) {
    super(scene);
    this.reset = this.reset.bind(this);
    //this.start_x = 432;
    //this.start_y = 0;
    this.start_x = x;
    this.start_y = y;
    this.max_speed = 32;
  }

  reset () {
    this.ball.setPosition(this.start_x, this.start_y);
    this.ball.setVelocity(0,0);
  }

  getPosition () {
    return {x: this.ball.x, y: this.ball.y };
  }

  create () {
    super.create();

    this.circle = this.scene.add.circle(this.start_x, this.start_y, 16, 0xff0000);
    this.scene.add.existing(this.circle);
    this.ball = this.scene.matter.add.gameObject(this.circle).setCircle(16);
    this.ball.setMass(1);
    this.ball.setBounce(0.8);
    this.ball.setCollisionCategory(cCollisionBall);
    this.ball.setCollidesWith([cCollisionSparks, cCollisionObjects, cCollisionWorld, cCollisionFlipper]);

    /***
    this.sensor_circle = this.scene.add.circle(this.start_x, this.start_y, 32, 0x000022);
    this.sensor = this.scene.matter.add.gameObject(this.sensor_circle, {isSensor:false}).setCircle(32);
    this.sensor.setCollisionCategory(cCollisionBall);
    this.sensor.setCollidesWith([cCollisionFlipper]);
    this.sensor.setMass(0.1);
    this.sensor.setFriction(0);
    this.sensor.setBounce(0);
    this.sensor.setVisible(false);
    this.scene.matter.add.constraint(this.ball, this.sensor, 0, 1);
    this.sensor.setOnCollide((pair) => {
      console.log("Ball/Flipper warning!");
    });
    ***/

    this.scene.cameras.main.startFollow(this.ball);
    return this;
  }

  update () {
    super.update();
  }
}