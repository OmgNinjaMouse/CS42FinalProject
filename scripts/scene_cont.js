
class ContinueClock extends BasicObject {
    constructor(parent, x, y) {
        super(parent);
        this.x = x;
        this.y = y;
    }

    create () {
        super.create();
        this.text = this.scene.add.text(this.x, this.y, "");
    }

    refresh (time_remaining_ms) {
        this.time = time_remaining_ms;
    }

    update () {
        super.update();
        this.text.setText(Math.ceil(this.time/1000));
    }
}

class ContinuePic extends BasicObject {
    constructor(parent, x, y) {
        super(parent);
        this.x = x;
        this.y = y;
    }

    preload () {
        this.scene.load.plugin('rexroundrectangleplugin', 'resources/rexroundrectangleplugin.min.js', true);   
    }

    create () {
        super.create();
        this.rect = this.scene.add.rexRoundRectangle(0,0,128,128,12, 0x00ff00, 1);
        this.obj = this.scene.physics.add.existing(this.rect);
        this.obj.setPosition(this.x, this.y);
    }

    setPosition (x, y) {
        this.x = x;
        this.y = y;
        this.obj.setPosition(this.x, this.y);
    }
}

class SceneContinue extends BasicScene {
    constructor () {
        super("SceneContinue");
        let x = getModel().config.width / 2;
        let y = getModel().config.height * 0.2;
        this.addObject("main_title", new MainTitle(this, x, y, "GAME OVER"));    
        this.addObject("sub_title", new MainTitle(this, x, y+80, "Info "));

        //this.addObject("pic", new ContinuePic(this, 128, 128));
        this.addObject("clock", new GameClock(this, (960/2), y+180));
        this.addObject("sprite_left", new SelectSprite(this, 960/2, 400, 0));
        this.ctrl_box = this.addObject("contbox", new TextCombat(this, 960/3, 500));
        this.exit_box = this.addObject("exitbox", new TextCombat(this, (960*2)/3, 500));


        this.addObject("bgm", new BgmAgent(this));
    }

    init () {
        super.init();
        this.countdown = 10000;
        this.pressed = false; 
    }

    create () {
        super.create();
        this.objects.bgm.play('continue');

        /* Spacebar to continue */
        /* Any other key to hurry the count */
        this.input.keyboard.on('keydown', (event) => {
            switch (event.code) {
                case "Space":
                    this.scene.start("SceneGameV2");
                    //getModel().brain.setHistory(this.game.model.history);
                    //getModel().brain.train(() => {
                    //    this.scene.start("SceneGameV2");
                    //});
                    break;
                default:
                    if (this.pressed == false) {
                        this.countdown -= 1000;
                        this.pressed = true;
                    }
                    break;
            }
        });

        this.input.keyboard.on("keyup", (event) => {
            this.pressed = false; 
        });
    }

    update () {
        super.update();

        let player_health = getModel().game_ctx.players[0].health;
        let ai_health = getModel().game_ctx.players[1].health;

        if (player_health > ai_health) {
            this.objects.sub_title.setMsg("You Win!");
            this.objects.sprite_left.playAni("lpc_walk_right")
        } else {
            this.objects.sub_title.setMsg("You Lose!");
            this.objects.sprite_left.playAni("lpc_dead")

        }

        this.exit_box.setMessage("Any Key to exit.");
        this.ctrl_box.setMessage("<Spc> to try again.");


        //console.log(this.countdown);
        if (this.delta_ms < 1000) {
            this.countdown -= this.delta_ms;
        }
        //this.objects.clock.refresh(this.countdown);
        getModel().game_ctx.time_remaining = this.countdown;

        if (this.countdown < 0) {
            this.scene.start("SceneTitle");
        }

    }
}