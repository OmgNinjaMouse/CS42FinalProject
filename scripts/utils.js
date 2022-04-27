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
  }

  addObject (key, basic_object) {
    this.objects[key] = basic_object;
    return basic_object;
  }

  init ()    { Object.keys(this.objects).forEach((key) => this.objects[key].init());    return this;}
  preload () { Object.keys(this.objects).forEach((key) => this.objects[key].preload()); return this;}
  create ()  { Object.keys(this.objects).forEach((key) => this.objects[key].create());  return this;}
  update ()  { Object.keys(this.objects).forEach((key) => this.objects[key].update());  return this;}

  getScene () {
    return this;
  }

  allObjects () {
    return Object.keys(this.objects).map( (key) => this.objects[key]);
  }
}