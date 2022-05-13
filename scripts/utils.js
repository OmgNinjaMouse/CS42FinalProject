class BasicObject {
  constructor (parent) {
    this.parent = parent;
    this.scene = parent.getScene();
    this.init = this.init.bind(this);
    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.addObject = this.addObject.bind(this);
    this.getScene = this.getScene.bind(this);
    this.allObjects = this.allObjects.bind(this);
    this.objects = {};
  }

  init ()    { Object.keys(this.objects).forEach((key) => this.objects[key].init());    return this; }
  preload () { Object.keys(this.objects).forEach((key) => this.objects[key].preload()); return this; }
  create ()  { Object.keys(this.objects).forEach((key) => this.objects[key].create());  return this; }
  update ()  { Object.keys(this.objects).forEach((key) => this.objects[key].update());  return this; }

  addObject (key, basic_object) {
    this.objects[key] = basic_object;
    return basic_object;
  }

  getScene () {
    return this.scene;
  }

  allObjects () {
    return Object.keys(this.objects).map( (key) => this.objects[key]);
  }
}

/**
 * RelocatableObject adds hierarchical positioning to the Basic Object container.
 * 
 */
class RelocatableObject extends BasicObject {
  constructor (parent, x, y) {
    super(parent);
    this.setPosition = this.setPosition.bind(this);
    this.refreshLoc = this.refreshLoc.bind(this);
    this.getLoc = this.getLoc.bind(this);
    this.setPosition(x, y);
    this.eventTbl = {};
  }

  /* Moves the relocatable object and all children */
  setPosition (x, y) {
    this.offset_x = x;
    this.offset_y = y;
    this.refreshLoc();
  }

  /* Refreshes the object position after a parent has been moved 
   * Overriding this method will allow for resetting phaser GameObject locations.
   */
  refreshLoc () {
    this.getLoc();
    console.log("RO (" + this.x + "," + this.y + ")");
    this.allObjects().forEach((obj) => (obj.refreshLoc != undefined) ? obj.refreshLoc(this.x) : 0);
  }


  getLoc () {
    this.x = (this.parent.x == undefined) ? this.offset_x : this.offset_x+this.parent.x;
    this.y = (this.parent.y == undefined) ? this.offset_y : this.offset_y+this.parent.y;
    return { x: this.x, y: this.y };
  }

  create () {
    super.create();
    this.refreshLoc();
  }

  dispatch (event) {
    this.allObjects().forEach( (obj) => obj.dispatch(event));
    let keys = Object.keys(this.eventTbl);
    if (keys.includes(event.toString())) {
      console.log("Handling " + event );
      this.eventTbl[event.toString()](event);
    }
  }

  listen (event, callback) {
    this.eventTbl[event] = callback;
  }
}

class BasicScene extends Phaser.Scene {
  constructor (key) {
    super(key);
    this.key = key;
    this.init = this.init.bind(this);
    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.addObject = this.addObject.bind(this);
    this.allObjects = this.allObjects.bind(this);
    this.objects = {};
    this.last_time = 0;
    this.delta_ms = 0;
  }

  addObject (key, basic_object) {
    this.objects[key] = basic_object;
    return basic_object;
  }

  init ()    { Object.keys(this.objects).forEach((key) => this.objects[key].init());    return this;}
  preload () { Object.keys(this.objects).forEach((key) => this.objects[key].preload()); return this;}
  create ()  { Object.keys(this.objects).forEach((key) => this.objects[key].create());  return this;}
  update ()  { 
    let now = Date.now();
    this.delta_ms = now - this.last_time;

    /* throw out the first sample */
    if (this.delta_ms > 1000) {
      this.delta_ms = 0;
    }
    
    this.last_time = now;
    
    Object.keys(this.objects).forEach((key) => this.objects[key].update());  
    return this;
  }

  getScene () {
    return this;
  }

  allObjects () {
    return Object.keys(this.objects).map( (key) => this.objects[key]);
  }
}