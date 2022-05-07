

class WireRail extends BasicObject {
  constructor (scene, x1, y1, x2, y2) {
    super (scene);
    this.start_loc = { x: x1, y: y1 };
    this.end_loc = { x: x2, y: y2 };
    this.midpt = { x: (x1+x2) / 2, y: (y1+y2) / 2 };
    this.angle_rad = Math.atan2( y2-y1, x2-x1 );
    this.length = Math.sqrt( Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    this.thickness = 20;
  }

  create () {
    super.create();
    this.start_post_mdl = this.scene.add.circle(this.start_loc.x, this.start_loc.y, this.thickness-1, 0x333333);
    this.scene.add.existing(this.start_post_mdl);
    this.start_obj = this.scene.matter.add.gameObject(this.start_post_mdl).setCircle(this.thickness-1);
    this.start_obj.setStatic(true);
    this.start_obj.setBounce(0.8);

    this.end_post_mdl = this.scene.add.circle(this.end_loc.x, this.end_loc.y, this.thickness-1, 0x333333);
    this.scene.add.existing(this.end_post_mdl);
    this.end_obj = this.scene.matter.add.gameObject(this.end_post_mdl).setCircle(this.thickness-1);
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