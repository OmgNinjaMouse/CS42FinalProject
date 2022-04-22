
class SceneTitle extends BasicScene {
  constructor() {
    super("SceneTitle");
    this.doOptions = this.doOptions.bind(this);
  }

  init () {
    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.2;
    this.addObject("main_title", new MainTitle(this, x, y, "COMBAT"));
    this.addObject("sub_title", new SubTitle(this, x, y+40, "Pinball "));


    let bx = getModel().config.width / 2;
    let by = getModel().config.height * 0.55;
    let btn_space = 85;
    this.addObject("play_btn", new MenuButton(this, bx, by, "Play"));
    this.addObject("options_btn", new MenuButton(this, bx, by+(btn_space), "Options", this.doOptions));
    this.addObject("credits_btn", new MenuButton(this, bx, by+(btn_space*2), "About"));
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

  doOptions () {
    console.log("here");
    this.scene.start("SceneOptions");
  }
}