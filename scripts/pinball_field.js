
class FieldBorder extends RelocatableObject {
  constructor(parent, x, y, width, height) {
    super(parent, x, y);
    this.border_width = width;
    this.border_height = height;
  }

  create () {
    super.create();
    let loc = this.getLoc();
    this.rail_mdl = this.scene.add.rectangle(loc.x, loc.y, this.border_width, this.border_height, 0xaa0000);
    this.scene.add.existing(this.rail_mdl);
    this.rail_obj = this.scene.matter.add.gameObject(this.rail_mdl);
    this.rail_obj.setStatic(true);
  }

  refreshLoc () {
    super.refreshLoc();
    let loc = this.getLoc();
    if (this.rail_obj != undefined) {
      this.rail_obj.setPosition(loc.x, loc.y);
    }
  }
}

class PinballField extends RelocatableObject {
  constructor(parent, x, y, width, height) {
    super(parent, x, y);
    this.width = width;
    this.height = height;

    this.addObject("frame_top", new FieldBorder(this, this.width/2, 0, this.width, 10));
    this.addObject("frame_btm", new FieldBorder(this, this.width/2, this.height, this.width, 10));
    this.addObject("frame_lft", new FieldBorder(this, 0, this.height/2, 10, this.height));
    this.addObject("frame_rgt", new FieldBorder(this, this.width, this.height/2, 10, this.height));
  }

  init () {
    super.init();
  }

  preload () {
    super.preload();
  }

  create () {
    super.create();
  }

  update () {
    super.update();
  }
}