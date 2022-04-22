

class BgmSlider extends BasicObject {
  constructor (parent, x, y, callback) {
    super(parent);
    this.bgm_volume = 0.5;
    this.x = x;
    this.y = y;
    this.callback = callback;

    this.type = "bgm";
    this.button_image = 'sprites/music.png';
  }

  preload () {
    super.preload();
    this.scene.load.spritesheet(this.type + '_bgm', this.button_image,
                          {frameWidth:64, frameHeight: 64});
    
    this.scene.load.audio('pop', 'sounds/interface5.wav');
  }

  create () {
    super.create();

    /* BGM and SFX sliders */
    let bgm_ep = [
      {x: this.x - 200, y: this.y },
      {x: this.x + 200, y: this.y }
    ];
    this.scene.add.graphics()
        .lineStyle(3, 0x55ff55, 1)
        .strokePoints(bgm_ep);
    
    this.bgm_btn = this.scene.add.sprite(this.x, this.y, this.type + '_bgm');
    this.bgm_btn.setScale(1.0);

    this.bgm_slider = this.scene.plugins.get('rexsliderplugin').add(this.bgm_btn, {
      endPoints: bgm_ep,
      value: this.bgm_volume
    });

    this.bgm_btn.on('pointerup', () => {
      this.bgm_volume = this.bgm_slider.value;
      this.callback(this.bgm_volume);
    });

    this.bgm_btn.on('pointerout', () => {
      this.bgm_volume = this.bgm_slider.value;
      this.callback(this.bgm_volume);
    });
  }


  update () {
    super.update();
    if (this.bgm_slider.value > 0) {
      this.bgm_btn.setFrame(1);
    } else {
      this.bgm_btn.setFrame(0);
    }
  }
}

class SfxSlider extends BgmSlider {
  constructor(parent, x, y, callback) {
    super(parent, x, y, callback);
    this.type = "sfx";
    this.button_image = "sprites/sound.png";
  }
}

class SceneOptions extends BasicScene {
  constructor() {
    super("SceneOptions");
    this.doMenu = this.doMenu.bind(this);
    this.updateBgm = this.updateBgm.bind(this);
    this.updateSfx = this.updateSfx.bind(this);
  }

  init () {
    super.init();

    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.2;
    this.addObject("main_title", new MainTitle(this, x, y, "COMBAT"));
    this.addObject("sub_title", new SubTitle(this, x, y+40, "Options "));


    let bx = getModel().config.width / 2;
    let by = getModel().config.height * 0.50;
    let btn_space = 85;
    this.addObject("bgm_volume", new BgmSlider(this, bx, by, this.updateBgm));
    this.addObject("sfx_volume", new SfxSlider(this, bx, by+btn_space, this.updateSfx));

    this.addObject("menu_btn", new MenuButton(this, bx, by+(btn_space*2), "Menu", this.doMenu));
  }

  updateBgm (volume) {
    getModel().options.bgm_volume = volume;
    getModel().options.bgm_enable = (volume > 0);
  }

  updateSfx (volume) {
    getModel().options.sfx_volume = volume;
    getModel().options.sfx_enable = (volume > 0);
  }


  preload () {
    super.preload();
    this.load.plugin('rexsliderplugin', 'resources/rexsliderplugin.min.js', true);

  }

  doMenu () {
    this.scene.start("SceneTitle");
  }

}