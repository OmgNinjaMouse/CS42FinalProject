
class Launcher extends RelocatableObject {
    Events = {
      RELEASED: 0,
      PULLING: 1
    }
    constructor(scene, x, y) {
      super(scene, x, y);
      this.fsmFree = this.fsmFree.bind(this);
      this.fsmPulling = this.fsmPulling.bind(this);
      this.fsmLaunch = this.fsmLaunch.bind(this);
  
      this.x = x;
      this.y = y;
      this.width = 28;
      this.pinSize = 2;
      this.mass = 6;
      this.spring_power = 0.5;
      this.hammerWidth = this.width - (this.pinSize*4)
      this.state = this.fsmFree;
      this.event = this.Events.RELEASED;
    }
  
    create () {
      super.create();
      /* Build a channel.  Ball is 16 radius, so 32+margin */
      this.rails = [
        {x: this.x-(this.width/2), y: this.y },
        {x: this.x+(this.width/2), y: this.y }
      ].map( (loc) => this.scene.add.rectangle(loc.x, loc.y, 2, this.width*3, 0x888888))
       .map( (mdl) => this.scene.matter.add.gameObject(mdl) )
       .map( (obj) => obj.setStatic(true).setFriction(0) );
  
      /* Build two pins for the ball to rest on */
      this.pins = [
        {x: this.x-(this.width/2)+(this.pinSize*2), y: this.y },
        {x: this.x+(this.width/2)-(this.pinSize*2), y: this.y }
      ].map( (loc) => this.scene.add.circle(loc.x, loc.y, this.pinSize, 0x888888))
       .map( (mdl) => this.scene.matter.add.gameObject(mdl))
       .map( (obj) => obj.setStatic(true).setFriction(0).setBounce(0));
  
      /* Create a hammer to hit the ball with */
      this.hammer = [
        { x: this.x, y: this.y }
      ].map( (loc) => this.scene.add.circle(loc.x, loc.y, this.hammerWidth/2, 0x3333aa))
      .map( (mdl) => this.scene.matter.add.gameObject(mdl) )
      .map( (obj) => obj.setMass(this.mass).setFriction(0).setFixedRotation() );
  
      /* Create two constraints on the hammer to pins to create the spring */
      this.springs = this.pins
        .map( (pin) =>
          this.scene.matter.add.constraint(
            this.hammer[0],   /* Object A */
            pin,              /* Object B */
            this.width/4,       /* Length */
            this.spring_power   /* Stiffness 0 soft => 1 hard */
          )
        );
  
      /* Create a static object to pull the hammer back with */
      let handle_mdl = this.scene.add.circle(this.x, this.y+this.hammerWidth, this.hammerWidth/2, 0);
      this.handle = this.scene.matter.add.gameObject(handle_mdl).setStatic(true);
  
      /* Constrain the hammer to the pullback */
      this.pullback = this.scene.matter.add.constraint(
        this.hammer[0],
        this.handle,
        this.hammerWidth,
        1.0
      );

      this.listen(ControlEvents.LAUNCH_PULL, () => this.pull());
      this.listen(ControlEvents.LAUNCH_RELEASE, () => this.release());
    }
  
    fsmFree () {
      /* If spacebar pressed */
      if (this.event == this.Events.PULLING) {
        this.tween = this.scene.tweens.add({
          targets: [this.handle],
          y: this.y+(this.width*2),
          duration: 1000
        });

        this.state = this.fsmPulling;
      }
    }
  
    fsmPulling () {
      /* If not spacebar pressed */
      /* Cut the pullback constraint */
      if (this.event == this.Events.RELEASED) {
        this.scene.matter.world.removeConstraint(this.pullback);
        this.resetCountdown = 500;
        this.tween.stop();
        this.state = this.fsmLaunch;
      }
  
    }
  
    fsmLaunch () {
      /* Wait for timeout */
      this.resetCountdown -= this.scene.delta_ms;
      if (this.resetCountdown <= 0) {
        /* Reset pull, hammer, and reset constraints */
        this.handle.setPosition(this.x, this.y+this.hammerWidth);
  
        /* Constrain the hammer to the pullback */
        this.pullback = this.scene.matter.add.constraint(
          this.hammer[0],
          this.handle,
          this.hammerWidth,
          1.0
        );
  
        this.state = this.fsmFree;
      }
    }
  
    update () {
      super.update();
      this.state();
      //this.guard[0].angle = (this.guard[0].angle - 6) % 360;
    }
  
    pull () {
      this.event = this.Events.PULLING;
    }
  
    release () {
      this.event = this.Events.RELEASED;
    }
  }
  