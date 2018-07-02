import { game } from './game.module.js';
import { Stage } from './stage.module.js';
import { Physics } from './physics.module.js';
import { Multiplayer } from './multiplayer.module.js';

export var Players = {

  mainPlayer: {},
  others: {},
  skins: ['skin0', 'skin1', 'skin2', 'skin3'],

  addPlayer: function(playerData, isMain) {

    let player = game.add.sprite(Stage.spawnPoint.x, Stage.spawnPoint.y, playerData.skin);
    player.id = playerData.id;
    player.username = { text: playerData.username, x_offset: playerData.username.length * -5, y_offset: -60};
    player.username_tag = game.add.text(0, 0, playerData.username, { font: "20px Arial", fill: "#fff"});
    player.score = 0;
    player.skin = playerData.skin;
    player.anchor.setTo(0.5);
    game.physics.p2.enable([player], false);
    player.body.clearShapes();
    player.body.loadPolygon('charactersData', 'Player');
    player.body.setCollisionGroup(Physics.collisionGroup);
    player.body.collides(Physics.collisionGroup);
    player.body.restitution = 0;
    isMain ? this.setMain(player) : this.setOther(player);
  },

  setMain: function(player){
    player.stats = { maxSpeed: 725, maxOxygen: 15, maxForce: 6750};
    player.oxygen = 15;
    player.inWater = false;
    player.timestamp = Date.now();
    player.inputEnabled = true;
    player.events.onInputDown.add(Physics.flap, this);
    game.camera.follow(player);
    this.mainPlayer = player;
  },

  getScaledPointer: function(){
    return {x: game.input.activePointer.worldX * (1/game.world.scale.x), y: game.input.activePointer.worldY * (1/game.world.scale.y)};
  },

  setOther: function(player){
    player.body.data.gravityScale = 0;
    this.others[player.id] = player;
  },

  controlMain: function() {

    if (Object.keys(this.mainPlayer).length > 1) {
      let pointer = this.getScaledPointer();
      Physics.isInWater() ? Physics.waterPhysics(pointer) : Physics.airPhysics(pointer);

      this.checkBestNewScore(this.mainPlayer);
      Multiplayer.socket.emit('playerAction', {
        id: this.mainPlayer.id,
        username: this.mainPlayer.username.text,
        skin: this.mainPlayer.skin,
        x: this.mainPlayer.body.x,
        y: this.mainPlayer.body.y,
        rotation: this.mainPlayer.body.rotation,
        v_x: this.mainPlayer.body.velocity.x,
        v_y: this.mainPlayer.body.velocity.y,
        scale_y: this.mainPlayer.scale.y
      });

      this.repositionUsernameTag(this.mainPlayer);
    }
  },

  controlOther: function(playerData) {
    this.others[playerData.id].body.x = playerData.x;
    this.others[playerData.id].body.y = playerData.y;
    this.others[playerData.id].body.rotation = playerData.rotation;
    // this.others[playerData.id].body.velocity.x = playerData.v_x; //causes stuittering
    // this.others[playerData.id].body.velocity.x = playerData.v_y; //causes stuttering
    this.others[playerData.id].scale.y = playerData.scale_y;
    this.repositionUsernameTag(this.others[playerData.id]);
  },

  restoreOxygen: function() {
    this.mainPlayer.oxygen = this.mainPlayer.stats.maxOxygen;
  },


  decreaseOxygen: function(){
    setInterval(() => {
      this.mainPlayer.oxygen--;
      if(this.mainPlayer.oxygen === 0){
        Multiplayer.socket.emit('dead', this.mainPlayer.id);
        this.setCarcass(this.mainPlayer);
        this.killAndRespawn(this.mainPlayer)
      }
    }, 1000);
  },

  repositionUsernameTag(player){
    player.username_tag.x = player.x + player.username.x_offset;
    player.username_tag.y = player.y + player.username.y_offset;
  },

  setCarcass: function(player){
    let carcass = game.add.sprite(player.body.x, player.body.y, 'dead');

    carcass.anchor.setTo(0.5);
    carcass.rotation = player.body.rotation;
    //clean carcass after 20 seconds
    setTimeout(() => {
      carcass.destroy();
    }, 20000);
  },

  killAndRespawn: function(player){
    player.kill();
    setTimeout(() => {
      player.reset(Stage.spawnPoint.x, Stage.spawnPoint.y);
    }, 5000);
  },

  checkBestNewScore: function(player){
    let score = 16000 - player.y;
    if(score > player.score){
      player.score = parseInt(score);
    }
  }

}
