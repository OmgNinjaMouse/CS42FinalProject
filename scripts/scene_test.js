

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
    this.addObject("ball", new BallV2(this, 400, 100) );
    this.objects.playerCtrl.listen(this.dispatch);

    this.addObject("slingshot_l", new SlingshotLeft(this, 300, 300));
    this.addObject("slingshot_r", new SlingshotRight(this, 400, 300));


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