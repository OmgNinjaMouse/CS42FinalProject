
class ContinueClock extends BasicObject {
    constructor(parent, x, y) {
        super(parent);
        this.x = x;
        this.y = y;
    }
}

class ContinuePic extends BasicObject {
    constructor(parent, x, y) {
        super(parent);
        this.x = x;
        this.y = y;
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

    create () {
        super.create();
        this.objects.bgm.play('continue');
        
        /* Spacebar to continue */
        /* Any other key to hurry the count */
    }

    update () {
        super.update();

    }
}