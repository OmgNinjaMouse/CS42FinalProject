
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

    this.lever_sz = 32;
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
      duration: 100,
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
    this.body.setMass(10);
    this.body.setCollisionCategory(cCollisionFlipper);
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
    this.scene.matter.add.constraint(this.body, this.lever.body, 0, 0.4, {
      pointA: new Phaser.Math.Vector2(lever_offset, 0),
      pointB: new Phaser.Math.Vector2()
    });

    return this;
  }
}

