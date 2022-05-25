class GroupManager extends RelocatableObject {
  constructor (parent, x, y) {
    super(parent, x, y);
    this.groups = {};
  }

  init () {
    this.side = this.parent.obj_key;

    this.listen(ControlEvents.REGISTER_GROUP, (event, data) => {
      console.log(this.side + " Group Register to " + data.grp + " by " + data.id);
      let group_list = Object.keys(this.groups);
      if (group_list.includes(data.grp) == false) {
        this.groups[data.grp] = {};
      }
      this.groups[data.grp][data.id] = { state: false };
    });

    this.listen(ControlEvents.GROUP_UPDATE, (event, data) => {
      console.log(this.side + " Group Update to " + data.grp + " by " + data.id );
      this.groups[data.grp][data.id] = { state: true };
      let status = Object.keys(this.groups[data.grp])
        .map( (obj_id) => this.groups[data.grp][obj_id])
        .reduce((data, obj) => {
          return {
            lit: data.lit + ((obj.state) ? 1 : 0),
            count: data.count + 1
          }
        }, { lit: 0, count: 0 })
      
      if (status.lit == status.count) {
        console.log(this.side + " Group " + data.grp + " completed!");
        setTimeout(() => {
            this.scene.q(ControlEvents.GROUP_COMPLETE, { side: this.parent.obj_key, grp: data.grp });
            this.sfx[Math.floor(Math.random() * this.sfx.length)].play({ volume: getModel().options.sfx_volume });
            this.notify({type: "score", source: data.grp})
        }, 200);
      }
    })

    this.listen(ControlEvents.GROUP_CLEAR, (event, data) => {
      this.groups[data.grp][data.id] = { state: false };
    })
  }

  preload () {
    super.preload();
    this.scene.load.audio("group", "./sounds/lokif_gui/positive.wav");

  }

  create () {
    super.create();
    this.sfx = [
      this.scene.sound.add("group")
    ]
  }
}


class SceneGameV2 extends BasicScene {
  constructor () {
    super({
      key: "SceneGameV2",
      physics: {
          default: 'matter',
          matter: {
              debug: false,
          }
      }

    });
    this.dispatch = this.dispatch.bind(this);
    this.doAi = this.doAi.bind(this);
    this.doMl = this.doMl.bind(this);

    this.addObject("bgm", new BgmAgent(this));

    // 960/2 = 
    let screen_width = 960;
    let screen_height = 540;

    let side_margin = 50;
    let top_margin = 100;
    let field_width = 300;
    let field_height = 400;

    this.addObject("bgimg", new BackgroundImage(this, 0, 0, "game_bg", "images/forest_fight.jpeg"))
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

    this.objects.left_field.setScoreCb( (data) => {
      console.log("Left score - source:" + data.source + " points:" + data.value);
      getModel().game_ctx.players[0].health += (data.value / 2);
      getModel().game_ctx.players[1].health -= data.value;
    });

    this.objects.right_field.setScoreCb( (data) => {
      console.log("Right score - source:" + data.source + " points:" + data.value);
      getModel().game_ctx.players[0].health -= data.value;
      getModel().game_ctx.players[1].health += (data.value / 2);
    });

  }
  
  init () {
    super.init();
    let mdl = getModel();
    mdl.game_ctx.time_remaining = 99 * 1000;
    this.objects.playerCtrl.listen(this.dispatch);

    getModel().game_ctx.players.forEach( (player) => {
      player.health = mdl.game_ctx.max_health;
    })
    this.game_start = false;

    this.last_status = Date.now();
    this.status_delay = 200;
    this.ai_clock = 0;
    //getModel().history = [];
  }

  dispatch (uiEvent, data) {
    let side = "left_field"
    if (data.side != undefined) {
      side = data.side;
    }

    this.objects[side].dispatch(uiEvent, data);
  }

  q (uiEvent, data) {
    setTimeout(() => this.dispatch(uiEvent, data), 0);
  }

  preload () {
    super.preload();
    this.load.audio("round_one", "./sounds/announcer/round_one.wav");
    this.load.audio("fight", "./sounds/announcer/fight.wav");
  }

  create () {
    super.create();
    let bgm_name = "battle_" + Math.floor(Math.random() * 4);
    this.objects.bgm.play(bgm_name);

    this.matter.world.setBounds(0,0,960, 540, 64, true, true, true, true);
    //this.matter.world.setFPS(120);
    this.matter.world.engine.positionIterations=120;
    this.matter.world.engine.velocityIterations=120;

    this.objects.left_name.setName(getModel().game_ctx.players[0].name);
    this.objects.right_name.setName(getModel().game_ctx.players[1].name);
    this.objects.right_name.justify(true);

    this.objects.left_health.justify(true);

    this.round_sfx = this.sound.add("round_one");
    this.fight_sfx = this.sound.add("fight");

    this.round_sfx.once("complete", () => this.fight_sfx.play({ volume: getModel().options.sfx_volume*4 }));
    this.fight_sfx.once("complete", () => {
      this.game_start = true
      this.objects["left_field"].start();
      this.objects["right_field"].start();
    });
    this.round_sfx.play({ volume: getModel().options.sfx_volume*4 });

  }

  doAi () {
    let ai_event = -1;

    /* Check if the ball is in the launcher.  If the ball is there, 
     * pull back if needed, then release
     */ 
    let ai_status = this.objects.right_field.getStatus();
    if ((ai_status.ball_x > 310) && (ai_status.ball_y > 350)) {
      if (ai_status.spring_y > 30) {
        ai_event = ControlEvents.LAUNCH_PULL; 
      } else {
        ai_event = ControlEvents.LAUNCH_RELEASE; 
      }
    }

    if (ai_event >= 0) {
      this.objects["right_field"].dispatch(ai_event, {});
    }
  }

  doMl (ai_status, output_cb) {

    /* AI events */
    getModel().brain.predict(ai_status, (prediction) => {
      //console.log(prediciton);
      if (prediction == undefined) {
        return;
      }
      /* For each possible action, roll dice against confidence level that we should do it */
      /* If random < confidence, go for it.  Dispatch to right field.  */
      let salt = Math.random();
      let ai_index = -1;
      while ((salt > 0) && (ai_index < prediction.length)) {
        ai_index++;
        salt -= prediction[ai_index].confidence;
      }

      if (ai_index < prediction.length) {
        let label = prediction[ai_index].label;
        let ai_event = -1;
        switch (label) {
          default:
          case "None":
            break;
          case "user_left_flip_up":   ai_event = ControlEvents.LEFT_FLIP_UP;  break;
          case "user_right_flip_up":  ai_event = ControlEvents.RIGHT_FLIP_UP; break;
          case "user_left_flip_dn":   ai_event = ControlEvents.LEFT_FLIP_DN; break;
          case "user_right_flip_dn":  ai_event = ControlEvents.RIGHT_FLIP_DN; break;
          case "user_pull": 
            ai_event = ControlEvents.LAUNCH_PULL; 
            break;
          case "user_release":        
            ai_event = ControlEvents.LAUNCH_RELEASE; 
            break;
          case "user_left_tilt":      ai_event = ControlEvents.LEFT_TILT; break;
          case "user_right_tilt":     ai_event = ControlEvents.RIGHT_TILT; break;
        }
        if (ai_event >= 0) {
          //console.log("Right dispatch: " + action.label + " evt:" + ai_event);
          output_cb(ai_event);
        }
      }
    })
  }

  update () {
    super.update();

    if (this.game_start) {
      getModel().game_ctx.time_remaining -= this.delta_ms;

      if (getModel().game_ctx.time_remaining <= 0) {
        this.scene.start("SceneContinue");
      }
    }

    if (this.last_time > (this.last_status + this.status_delay)) {
      this.last_status = this.last_time;
      let status = this.objects.left_field.getStatus();
      getModel().history.push(status);

      let status_b = this.objects.right_field.getStatus();
      getModel().history_b.push(status_b);
    }

    this.ai_clock -= this.delta_ms;
    if (this.ai_clock < 0) {
      this.ai_clock = 200;

      if (getModel().options.auto_learn) {
        this.doMl(this.objects.left_field.getStatus(), (ui_event) => {
          this.objects["left_field"].dispatch(ui_event, {});
        });      
      }
  
      if (getModel().options.ml_enable) {
        this.doMl(this.objects.right_field.getStatus(), (ui_event) => {
          this.objects["right_field"].dispatch(ui_event, {});
        });
      } else {
        this.doAi();
      }  
    }

    getModel().game_ctx.players.forEach( (player, idx) => {
      if (player.health > 200) {
        player.health = 200;
      }

      if (player.health < 0) {
        this.scene.start("SceneContinue");
      }
    })

    this.objects.stage.setHealth(getModel().game_ctx.players[0].health, getModel().game_ctx.players[1].health);
    this.objects.left_health.setHealth(getModel().game_ctx.players[0].health);
    this.objects.right_health.setHealth(getModel().game_ctx.players[1].health);
  }

}