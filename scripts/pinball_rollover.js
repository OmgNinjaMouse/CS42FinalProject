

class Rollover extends RelocatableObject {
  constructor (parent, x, y ) {
    super(parent, x, y);
  }

  init () {
    super.init();
    this.lit = false;
    this.radius = 8;
  }

  preload () {
    super.preload();
    this.scene.load.image("rollover_dark", "./sprites/rollover_dark.png");
    this.scene.load.image("rollover_lit", "./sprites/rollover_lit.png");

  }

  create () {
    super.create();
    
    let loc = this.getLoc();
    this.circle = this.scene.add.image(loc.x, loc.y, "rollover_dark");
    this.scene.add.existing(this.circle);

    this.marker = this.scene.matter.add.gameObject(this.circle).setCircle(this.radius);
    this.marker.setSensor(true);
    this.marker.setStatic(true);
    this.marker.setCollidesWith([cCollisionBall]);

    this.marker.setOnCollide((pair) => {
      this.ignite();
    });
  }

  ignite () {
    this.lit = true;
    this.marker.setTexture("rollover_lit");
  }

  reset () {
    this.lit = false;
    this.marker.setTexture("rollover_dark");
  }

  update () {
    super.update();
  }
}