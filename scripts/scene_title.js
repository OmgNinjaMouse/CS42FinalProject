
class SceneTitle extends BasicScene {
  constructor() {
    super("SceneTitle");
    this.doOptions = this.doOptions.bind(this);
    this.doAbout = this.doAbout.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  init () {
    let x = getModel().config.width / 2;
    let y = getModel().config.height * 0.2;
    this.addObject("main_title", new MainTitle(this, x, y, "COMBAT"));
    this.addObject("sub_title", new SubTitle(this, x, y+40, "Pinball "));
    this.addObject("bgm", new BgmAgent(this));


    let bx = getModel().config.width / 2;
    let by = getModel().config.height * 0.55;
    let btn_space = 85;
    this.addObject("play_btn", new MenuButton(this, bx, by, "Play", this.startGame));
    this.addObject("options_btn", new MenuButton(this, bx, by+(btn_space), "Options", this.doOptions));
    this.addObject("credits_btn", new MenuButton(this, bx, by+(btn_space*2), "About", this.doAbout));
  }

  preload () {
    super.preload();
    this.load.json('character_data', 'characters/characters.json');
  }

  create () {
    super.create();
    this.objects.bgm.play('menu_bgm');

    if (getModel().options.developer_mode) {
      this.input.keyboard.on('keydown', (event) => {
        switch (event.code) {
            case "Backslash":
              /* Skip to Gameplay for Debug  */
              this.load.json("field", getModel().game_ctx.level_fn);
              this.load.json("p1_lang", getModel().game_ctx.players[0].language_fn);
              this.load.json("p2_lang", getModel().game_ctx.players[1].language_fn);
              this.load.once(Phaser.Loader.Events.COMPLETE, () => {
                console.log("Level JSON loaded.");
                let ctx = getModel().game_ctx;
                ctx.level = this.cache.json.get('field');
                getModel().game_ctx.players[0].language = this.cache.json.get("p1_lang");
                getModel().game_ctx.players[1].language = this.cache.json.get("p2_lang");
                this.scene.start("SceneDialog");
              });
              this.load.start();
              
              break;
            case "Delete":
              /* Hidden Test Scene for physics sandbox */
              this.scene.start("SceneTest");
              break;
            case 'KeyL':
                /* Utility for loading a game history file */
                this.load.json('seed', "model/seed.json");
                this.load.once(Phaser.Loader.Events.COMPLETE, () => {
                  this.game.model.history = this.cache.json.get('seed');
                  console.log("Seeded History loaded.");
                });
                this.load.start();
                break;
            case 'KeyI':
                getModel().brain.load();
                break;
            case 'KeyK':
                getModel().brain.loadData();
                break;
            case 'KeyO':
                getModel().brain.setHistory(this.game.model.history);
                getModel().brain.train();
                break;
            case 'KeyP':
                getModel().brain.saveModel();
                break;
            case "Semicolon":
                getModel().brain.saveData();
                break;
            case "KeyQ":
                /* Utility for saving a game history file */
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getModel().history));
                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "scene.json");
                dlAnchorElem.click();
                break;
            default:
              console.log(event.code);
              break;
        }
      });
    }

    this.characters = this.cache.json.get('character_data');
    getModel().game_ctx.characters = this.characters.characters;
  }

  update () {
    super.update();
  }

  startGame () {
    this.scene.start("SceneSelect");
    //this.scene.start("SceneGame");
  }

  doOptions () {
    console.log("here");
    this.scene.start("SceneOptions");
  }

  doAbout () {
    console.log("about");
    this.scene.start("SceneAbout");
  }
}