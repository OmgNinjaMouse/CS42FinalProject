
class Nameplate extends RelocatableObject {
  constructor (parent, x, y) {
    super(parent, x, y);
    this.justify = this.justify.bind(this);
    this.setName = this.setName.bind(this);
    this.name = "";
  }

  create () {
    super.create();
    let loc = this.getLoc();
    this.text = this.scene.add.text(loc.x, loc.y, "--", { fontFamily: 'combat', fontSize:'18px'});
    this.text.setOrigin(0,0);
  }

  setName(name) {
    this.name = name;
    this.text.setText(this.name);
  }

  justify(is_right) {
    if (is_right) {
      this.text.setOrigin(1,0);
    } else {
      this.text.setOrigin(0,0);
    }
  }
}