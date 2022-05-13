

class WireRailV2 extends RelocatableObject {
  constructor (scene, x1, y1, x2, y2) {
    super (scene, x1, y1);
    this.dx = x2 - x1;
    this.dy = y2 - y1;
    this.thickness = 8;
  }

  init () {
    super.init();

    let loc = this.getLoc();
    this.start_loc = { x: loc.x, y: loc.y };
    this.end_loc = { x: loc.x+this.dx, y: loc.y+this.dy };

    this.midpt = { 
      x: (this.start_loc.x+this.end_loc.x) / 2, 
      y: (this.start_loc.y+this.end_loc.y) / 2 
    };
    this.angle_rad = Math.atan2( this.dy, this.dx );
    this.length = Math.sqrt( Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
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
    return this;
  }
}


class Wire extends WireRailV2 {
  constructor (scene, x1, y1, x2, y2) {
    super(scene, x1, y1, x2, y2);
    this.thickness = 2;
  }
}