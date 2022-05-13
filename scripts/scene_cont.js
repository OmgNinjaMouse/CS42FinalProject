
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
        this.addObject("pic", new ContinuePic(this, 128, 128));
        this.addObject("clock", new ContinueClock(this));
        this.addObject("bgm", new BgmAgent(this));
    }

    init () {
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

        //console.log(this.countdown);
        if (this.delta_ms < 1000) {
            this.countdown -= this.delta_ms;
        }
        this.objects.clock.refresh(this.countdown);

        if (this.countdown < 0) {
            this.scene.start("SceneTitle");
        }

    }
}