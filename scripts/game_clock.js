
class GameClock extends RelocatableObject {
  constructor (parent, x, y) {
    super(parent, x, y);
  }

  create () {
    super.create();
    let loc = this.getLoc();

    this.arc = this.scene.add.arc(loc.x, loc.y, 5+(72/2), -90, 360-90, true, 0x666699);
    this.circle = this.scene.add.circle(loc.x, loc.y, 72/2, 0x333366);
    this.text = this.scene.add.text(loc.x, loc.y, "99", { fontFamily: 'clock', fontSize:'72px'});
    this.text.setOrigin(0.5);

  }

  refreshLoc () {
    super.refreshLoc();
  }

  update () {
    super.update();
    let mdl = getModel();
    let time = mdl.game_ctx.time_remaining / 1000;
    let fraction = (mdl.game_ctx.time_remaining % 1000) / 1000;
    this.text.setText(Math.ceil(time));
    this.arc.setEndAngle((360 * fraction)-90);

    if (time <= 10) {
      let odd = ((Math.ceil(time) % 2) > 0);
      this.arc.setFillStyle((odd) ? 0xff4444 : 0x666699,1);
    }
  }
} 