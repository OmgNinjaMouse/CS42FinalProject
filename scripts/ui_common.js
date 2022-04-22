
class MainTitle extends BasicObject {
  constructor(parent, x, y, msg) {
    super(parent);
    this.x = x;
    this.y = y;
    this.msg = msg;
  }

  create () {
    let x = this.x;
    let y = this.y;

    this.titleBack =  this.scene.add.text(x, y, this.msg, { fontFamily: 'combat', fontSize: '72px', fontStyle: 'bold'});
    this.titleBack.setOrigin(0.5);
    this.titleBack.setTint(0xaaffaa);
    this.titleBack.setDepth(1);

    this.titleFront = this.scene.add.text(x, y, this.msg, { fontFamily: 'combat', fontSize: '72px'});
    this.titleFront.setOrigin(0.5);
    this.titleFront.setTint(0x116633);
    this.titleFront.setDepth(2);
  }
}

class SubTitle extends BasicObject {
  constructor (scene, x, y, msg) {
    super(scene);
    this.x = x;
    this.y = y;
    this.msg = msg;
  }

  create () {
    super.create();
    let x = this.x;
    let y = this.y;

    this.titleBack = this.scene.add.text(x, y, this.msg, { fontFamily: 'pinball', fontSize: '72px', fontStyle: 'bold'});
    this.titleBack.setOrigin(0.5);
    this.titleBack.setTint(0xaaaaff);
    this.titleBack.setBlendMode('Multiply');
    this.titleBack.setDepth(3);
  
  
    this.titleFront = this.scene.add.text(x, y, this.msg, { fontFamily: 'pinball', fontSize: '72px'});
    this.titleFront.setOrigin(0.5);
    this.titleFront.setTint(0x3333aa);
    this.titleFront.setDepth(4);
  }
}

class MenuButton extends BasicObject {
  constructor (parent, x, y, msg, callback) {
    super(parent);
    this.x = x;
    this.y = y;
    this.msg = msg;
    this.text_lit = 0xaaaaff;
    this.text_dark = 0x888888;
    this.callback = callback;
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

    this.btn.on('pointerdown', (pointer) => {
      console.log("Button pushed!");
      this.callback();
    });

    this.txt = this.scene.add.text(this.x, this.y, this.msg, { fontFamily: 'pinball', fontSize: '48px' })
    this.txt.setOrigin(0.5);
    this.txt.setTint(this.text_dark);

  }

  update () {
    super.update();
  }
}