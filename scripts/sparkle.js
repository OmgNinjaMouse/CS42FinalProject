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
