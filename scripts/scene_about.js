let cMsg = "Game Controls\n\n";
cMsg += "    Z             - Left Flipper\n"
cMsg += "    /              - Right Flipper\n"
cMsg += "    <Spc>   - Launch\n"
cMsg += "    A             - Left Tilt\n"
cMsg += "    '              - Right Tilt\n"

let sMsg = "The Picnic War\n\n";
sMsg += "The residents of the enchanted forest\n"
sMsg += "have begun the epic battle for... lunch.\n\n"
sMsg += "Use your flippers and tilt abilities to\n"
sMsg += "complete target combos and defeat your \nopponent.\n"

class SceneAbout extends BasicScene {
  constructor() {
    super("SceneAbout");
    this.doMenu = this.doMenu.bind(this);

    this.addObject("bgm", new BgmAgent(this));

  }

  init () {
    super.init();

    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.2;
    this.addObject("main_title", new MainTitle(this, x, y, "COMBAT"));
    this.addObject("sub_title", new SubTitle(this, x, y+40, "Info "));

    this.ctrl_box = this.addObject("controls", new TextCombat(this, x/2, y+120));
    this.story_box = this.addObject("story", new TextCombat(this, (x*3)/2, y+120));

    let bx = getModel().config.width / 2;
    let by = getModel().config.height * 0.50;
    let btn_space = 85;

    this.addObject("menu_btn", new MenuButton(this, bx, by+(btn_space*2), "Menu", this.doMenu));
  }


  preload () {
    super.preload();
  }

  create () {
    super.create();
    this.objects.bgm.play('menu_bgm');
    this.ctrl_box.setMessage(cMsg);
    this.story_box.setMessage(sMsg);

  }

  doMenu () {
    this.scene.start("SceneTitle");
  }

}