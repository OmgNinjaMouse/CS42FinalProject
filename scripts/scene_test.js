
class SceneTest extends BasicScene {
  constructor () {
    super({
      key: "SceneTest",
      physics: {
          default: 'matter',
          matter: {
              debug: true,
          }
      }
    });
    this.dispatch = this.dispatch.bind(this);

    this.addObject("playerCtrl", new GameController(this, 0, 0));
    this.addObject("ball", new BallV2(this, 400, 200) );
    this.addObject("ball2", new BallV2(this, 500, 260));
    this.objects.playerCtrl.listen(this.dispatch);

    //this.addObject("rail_0", new WireRailV2(this, 450, 260, 450, 210));
    this.addObject("rail_1", new WireRailV2(this, 350, 290, 450, 260));
    this.addObject("rail_2", new WireRailV2(this, 350, 290, 200, 300));

    this.addObject("target", new BumpTargetLeft(this, 200, 280));

    this.addObject("rail_3", new WireRailV2(this, 550, 290, 450, 260));
    this.addObject("rail_4", new WireRailV2(this, 550, 290, 700, 300));

    this.addObject("target_r", new BumpTargetRight(this, 700, 280));

    this.addObject("target_t", new BumpTargetTop(this, 800, 280));
    this.addObject("target_b", new BumpTargetBottom(this, 850, 280));

  }

  init () {
    super.init();
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

  dispatch (uiEvent) {
    this.allObjects().forEach( (obj) => {
      if (obj.dispatch != undefined) {
        obj.dispatch(uiEvent);
      }
    });
  }

}