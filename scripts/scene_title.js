
class MainTitle extends BasicObject {
  constructor(parent) {
    super(parent);
  }

  create () {
    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.2;

    this.addObject("title0", this.scene.add.text(x, y, "COMBAT", { fontFamily: 'combat', fontSize: '72px', fontStyle: 'bold'}));
    this.objects["title0"].setOrigin(0.5);
    this.objects["title0"].setTint(0xaaffaa);
    this.objects["title0"].setDepth(1);

    this.addObject("title1", this.scene.add.text(x, y, "COMBAT", { fontFamily: 'combat', fontSize: '72px'}));
    this.objects["title1"].setOrigin(0.5);
    this.objects["title1"].setTint(0x116633);
    this.objects["title1"].setDepth(2);
  }
}

class SubTitle extends BasicObject {
  constructor (scene) {
    super(scene);
  }

  create () {
    super.create();
    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.2;

    this.addObject("title2", this.scene.add.text(x, y+40, "Pinball ", { fontFamily: 'pinball', fontSize: '72px', fontStyle: 'bold'}));
    this.objects["title2"].setOrigin(0.5);
    this.objects["title2"].setTint(0xaaaaff);
    this.objects["title2"].setBlendMode('Multiply');
    this.objects["title2"].setDepth(3);
  
  
    this.addObject("title3", this.scene.add.text(x, y+40, "Pinball ", { fontFamily: 'pinball', fontSize: '72px'}));
    this.objects["title3"].setOrigin(0.5);
    this.objects["title3"].setTint(0x3333aa);
    this.objects["title3"].setDepth(4);
  }
}

class MenuButton extends BasicObject {
  constructor (parent, x, y, msg) {
    super(parent);
    this.x = x;
    this.y = y;
    this.msg = msg;
    this.text_lit = 0xaaaaff;
    this.text_dark = 0x888888;
  }

  preload () {
    super.preload();
    this.scene.load.image("button", "./sprites/button_dark.png");
    this.scene.load.image("button_hover", "./sprites/button_lit.png");

  }

  create () {
    super.create();
    this.btn = this.scene.add.sprite(this.x, this.y, "button");
    //this.btn.setOrigin(0.5);
    this.btn.setInteractive();

    this.btn.on('pointerover', (pointer) => {
      this.btn.setTexture('button_hover');
      this.txt.setTint(this.text_lit);
    });
  
    this.btn.on('pointerout', (pointer) => {
      this.btn.setTexture('button');
      this.txt.setTint(this.text_dark);
    });

    this.txt = this.scene.add.text(this.x, this.y, this.msg, { fontFamily: 'pinball', fontSize: '48px' })
    this.txt.setOrigin(0.5);
    this.txt.setTint(this.text_dark);

  }

  update () {
    super.update();
  }
}

class SceneTitle extends BasicScene {
  constructor() {
    super("SceneTitle");
    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.55;
    let btn_space = 85;

    this.addObject("main_title", new MainTitle(this));
    this.addObject("sub_title", new SubTitle(this));

    this.addObject("play_btn", new MenuButton(this, x, y, "Play"));
    this.addObject("options_btn", new MenuButton(this, x, y+(btn_space), "Options"));
    this.addObject("credits_btn", new MenuButton(this, x, y+(btn_space*2), "About"));

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