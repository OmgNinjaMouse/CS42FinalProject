
class CharacterStage extends RelocatableObject {
  constructor(parent, x, y, width) {
    super(parent, x,y);
    this.width = width;
  }

  init() {
    let char_mdl = getModel().game_ctx.players;
    this.addObject("left_char", new LpcSprite(this, char_mdl[0].key, char_mdl[0].spritesheet, 0, 0));
    this.addObject("right_char", new LpcSprite(this, char_mdl[1].key, char_mdl[1].spritesheet, this.width-64, 0));

  }

  refreshLoc () {
    super.refreshLoc();
  }

  create () {
    super.create();
    this.refreshLoc();
  }
}


class HealthBar extends RelocatableObject {
  constructor(parent, x, y, width) {
    super(parent, x, y);
    this.justify = this.justify.bind(this);
    this.setHealth = this.setHealth.bind(this);

    console.log("Width:" + width);
    this.width = width;
    this.height = 30;
    this.health = 100;
    this.max_health = 100;
  }

  init () {
    super.init();
    this.is_right = false;
  }

  create () {
    let loc = this.getLoc();
    this.background = this.scene.add.rectangle(loc.x, loc.y, this.width, this.height, 0x333366);
    this.scene.add.existing(this.background);
    this.background.setOrigin(0, 0.5);      

    this.foreground = this.scene.add.rectangle(loc.x, loc.y, (this.width*0.95)*(this.health/this.max_health), this.height*0.8, 0x116633);
    this.scene.add.existing(this.foreground);
    this.foreground.setOrigin(0, 0.5);
  }

  justify (is_right) {
    this.is_right = is_right;
    if (this.is_right) {
      this.background.setOrigin(1, 0.5);
      this.foreground.setOrigin(1, 0.5);
    } else {
      this.background.setOrigin(0, 0.5);      
      this.foreground.setOrigin(0, 0.5);
    }
  }

  setHealth (health) {
    this.health = health;
    this.foreground.setSize((this.width*0.95)*(this.health/this.max_health), this.height*0.8);
    this.justify(this.is_right);
  }

}

class SceneGameV2 extends BasicScene {
  constructor () {
    super({
      key: "SceneGameV2",
      physics: {
          default: 'matter',
          matter: {
              debug: true,
          }
      }

    });
    this.dispatch = this.dispatch.bind(this);

    this.addObject("bgm", new BgmAgent(this));

    // 960/2 = 
    let screen_width = 960;
    let screen_height = 540;

    let side_margin = 50;
    let top_margin = 100;
    let field_width = 300;
    let field_height = 400;

    this.addObject("left_field", new PinballField(this, side_margin, top_margin, field_width, field_height));
    this.addObject("right_field", new PinballField(this, screen_width-field_width-side_margin, top_margin, field_width, field_height));
    this.addObject("clock", new GameClock(this, screen_width/2, top_margin/2));
    this.addObject("left_name", new Nameplate(this, side_margin/2,top_margin/8));
    this.addObject("right_name", new Nameplate(this, screen_width-(side_margin/2), top_margin/8));

    this.addObject("left_health", 
      new HealthBar(this, 
                    (screen_width/2)-side_margin, 
                    top_margin/2, 
                    (screen_width/2)-(side_margin*1.5)
      )
    );
    this.addObject("right_health", 
      new HealthBar(this, 
                    (screen_width/2)+side_margin, 
                    top_margin/2, 
                    (screen_width/2)-(side_margin*1.5)
      )
    );

    this.addObject("stage", new CharacterStage(this, (side_margin*2)+field_width+10, screen_height/2, screen_width-(field_width*2)-(side_margin*3)));

    this.addObject("playerCtrl", new GameController(this, 0, 0));
  }
  
  init () {
    super.init();
    let mdl = getModel();
    mdl.game_ctx.time_remaining = 99 * 1000;
    this.objects.playerCtrl.listen(this.dispatch);
  }

  dispatch (uiEvent) {
    this.objects["left_field"].dispatch(uiEvent);
  }

  preload () {
    super.preload();
  }

  create () {
    super.create();
    let bgm_name = "battle_" + Math.floor(Math.random() * 4);
    this.objects.bgm.play(bgm_name);

    this.matter.world.setBounds(0,0,960, 540, 64, true, true, true, true);
    this.matter.world.engine.positionIterations=60;
    this.matter.world.engine.velocityIterations=60;

    this.objects.left_name.setName(getModel().game_ctx.players[0].name);
    this.objects.right_name.setName(getModel().game_ctx.players[1].name);
    this.objects.right_name.justify(true);

    this.objects.left_health.justify(true);
  }

  update () {
    super.update();
    getModel().game_ctx.time_remaining -= this.delta_ms;

    if (getModel().game_ctx.time_remaining <= 0) {
      this.scene.start("SceneContinue");
    }

    this.objects.left_health.setHealth(getModel().game_ctx.players[0].health);
    this.objects.right_health.setHealth(getModel().game_ctx.players[1].health);
  }

}