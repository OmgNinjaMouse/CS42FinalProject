
const ControlEvents = {
  LEFT_FLIP_UP: 0,
  LEFT_FLIP_DN: 1,
  RIGHT_FLIP_UP: 2,
  RIGHT_FLIP_DN: 3,
  LAUNCH_PULL: 4,
  LAUNCH_RELEASE: 5,
  ABORT: 6
}


class GameController extends RelocatableObject {
  constructor(parent, x, y) {
    super(parent, x, y);
    this.listen = this.listen.bind(this);
    this.txEvent = this.txEvent.bind(this);
    this.callback = null;
  }

  listen (callback_fn) {
    this.callback = callback_fn;
  }

  txEvent (event) {
    if (this.callback) {
      this.callback(event);
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