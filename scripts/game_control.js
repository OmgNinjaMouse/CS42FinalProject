
const ControlEvents = {
  LEFT_FLIP_UP: 0,
  LEFT_FLIP_DN: 1,
  RIGHT_FLIP_UP: 2,
  RIGHT_FLIP_DN: 3,
  LAUNCH_PULL: 4,
  LAUNCH_RELEASE: 5,
  ABORT: 6,
  REGISTER_GROUP: 7,
  GROUP_UPDATE: 8,
  GROUP_COMPLETE: 9,
  GROUP_CLEAR: 10,
  LEFT_TILT: 11,
  RIGHT_TILT: 12,
}


class GameController extends RelocatableObject {
  constructor(parent, x, y) {
    super(parent, x, y);
    this.listen = this.listen.bind(this);
    this.txEvent = this.txEvent.bind(this);
    this.tilt = this.tilt.bind(this);
    this.callback = null;
    this.last_tilt = Date.now();
    this.tilt_debounce = 500;
  }

  listen (callback_fn) {
    this.callback = callback_fn;
  }

  txEvent (event) {
    if (this.callback) {
      this.callback(event, {});
    }
  }

  tilt (ctrl_code) {
    let now = Date.now();
    if ((this.last_tilt + this.tilt_debounce) < now) {
      this.last_tilt = now;
      this.txEvent(ctrl_code);
      console.log("Tilt!!");
    }
  }

  create () {
    super.create();
    this.scene.input.keyboard.on('keydown', (event) => {
      switch (event.code) {
        case "KeyZ":       this.txEvent(ControlEvents.LEFT_FLIP_UP);   break;
        case "Slash":      this.txEvent(ControlEvents.RIGHT_FLIP_UP);  break;
        case "Space":      this.txEvent(ControlEvents.LAUNCH_PULL);    break;
        case "Backslash":  this.txEvent(ControlEvents.ABORT);          break;
        case "KeyA":       this.tilt(ControlEvents.LEFT_TILT);      break;
        case "Quote":      this.tilt(ControlEvents.RIGHT_TILT);     break;
        default:
          console.log(event.code);
          break;
      }
    });

    this.scene.input.keyboard.on('keyup', (event) => {
      switch (event.code) {
        case "KeyZ":       this.txEvent(ControlEvents.LEFT_FLIP_DN);   break;
        case "Slash":      this.txEvent(ControlEvents.RIGHT_FLIP_DN);  break;
        case "Space":      this.txEvent(ControlEvents.LAUNCH_RELEASE); break;
      }
    });
  }
}