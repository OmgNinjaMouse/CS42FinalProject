
class BgmManager {
  constructor () {
    this.init = this.init.bind(this);
    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);

    this.volume = 0.25;
    this.playing = false;
    this.unlocked = false;
    this.sound_sprites = {};
    this.playlist = [
      { key: 'menu_bgm', file: 'music/alert_outsider.mp3' },
      { key: 'battle_0', file: 'music/Blue_Garnet.mp3' },
      { key: 'battle_1', file: 'music/REVIVE_LUVS.mp3'},
      { key: 'battle_2', file: 'music/Silver.mp3' },
      { key: 'battle_3', file: 'music/2NEONS.mp3'},
      { key: 'continue', file: 'music/Shiokaze.mp3' }
    ]

    this.now_playing = [];
    this.requested = "";
  }

  init (scene) {

  }

  preload (scene) {
    console.log("Loading audio files.");
    this.playlist.forEach( (song_info) => {
      scene.load.audio(song_info.key, song_info.file);
    });
    
  }

  create (scene) {
    let config = {loop: true, volume: this.volume}
    if (this.unlocked == false) {
      this.playlist.forEach( (song_info) => {      
        this.sound_sprites[song_info.key] = scene.sound.add(song_info.key, config);
      });      
    }

    scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
      console.log("Sound unlocked.");
      this.unlocked = true;
    });
  }

  update (scene) {
    if (this.unlocked) {
      /* Determine which songs should be playing */
      let requests = [];
      requests.push(this.requested);
      
      /* If any songs are playing that shouldn't be, stop them */
      let stop_list = [];
      this.now_playing.forEach( (song) => {
        if (requests.includes(song) == false) {
          stop_list.push(song);
        }
      });
      stop_list.forEach( (song) => {
        console.log("Stopping song: " + song);
        this.sound_sprites[song].pause();
        let idx = this.now_playing.indexOf(song);
        this.now_playing.splice(idx, 1);
      });

      let keys = Object.keys(this.sound_sprites);
      keys.forEach( (song) =>{
        if (requests.includes(song) == false) {
          this.sound_sprites[song].pause();
        }
      })
      
      /* If any songs are requested but not already playing, start them */
      requests.forEach( (song) => {
        if (this.now_playing.includes(song) == false) {
          console.log("Starting song: " + song);
          this.now_playing.push(song);
          this.sound_sprites[song].play();
        }
      });
    }
  }

  play(song_key) {
    this.requested = song_key;
  }

  stop() {{
    this.requested = "";
  }}
}

class BgmAgent {
  constructor (scene) {
    this.scene = scene;
    this.init = this.init.bind(this);
    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
  }

  init () {
    getModel().bgm.init(this.scene);
  }

  preload () {
    getModel().bgm.preload(this.scene);
  }

  create () {
    getModel().bgm.create(this.scene);
  }

  update () {
    getModel().bgm.update(this.scene);
  }

  play (song_key) {
    getModel().bgm.play(song_key);
  }

  stop () {
    getModel().bgm.stop();
  }
}