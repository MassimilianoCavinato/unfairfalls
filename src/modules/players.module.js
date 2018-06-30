import { game } from './game.module.js';
import { Physics } from './physics.module.js';
import { Multiplayer } from './multiplayer.module.js';

export var Players = {

  mainPlayer: {},
  others: {},
  skins: ['skin0', 'skin1', 'skin2', 'skin3'],

  addPlayer: function(playerData, isMain) {

    let player = game.add.sprite(2200, 14000, this.getRandomSkin());
    player.id = playerData.id;
    player.username = { text: playerData.username, x_offset: playerData.username.length * -5, y_offset: -60};
    player.username_tag = game.add.text(0, 0, playerData.username, { font: "20px Arial", fill: "#fff"});
    player.anchor.setTo(0.5);
    game.physics.p2.enable([player], false);
    player.body.clearShapes();
    player.body.loadPolygon('charactersData', 'Player');
    player.body.setCollisionGroup(Physics.collisionGroup);
    player.body.collides(Physics.collisionGroup);
    isMain ? this.setMain(player) : this.setOther(player);
  },

  setMain: function(player){
    player.stats = { maxSpeed: 700, maxOxygen: 30, maxForce: 6500};
    player.oxygen = 30;
    player.inWater = false;
    player.timestamp = Date.now();
    player.inputEnabled = true;
    player.events.onInputDown.add(this.flap, this);
    player.pointer = game.input.activePointer;
    game.camera.follow(player);
    this.mainPlayer = player;
  },

  setOther: function(player){
    this.others[player.id] = player;
  },
  /*
      The state object below is a snapshot of the player sent with web socket which will be then broadcasted to all other players.
      This will probably change down the line, I don't think that all this data is necessary.
      Also, this data should be encoded client side and decoded server side to make TCP traffic faster.
  */
  controlMain: function() {

    if (Object.keys(this.mainPlayer).length > 1) {
      Physics.isInWater() ? Physics.waterPhysics() : Physics.airPhysics();
      this.repositionUsernameTag(this.mainPlayer);
      let state = {
        id: this.mainPlayer.id,
        username: this.mainPlayer.username.text,
        body: {
          x: this.mainPlayer.body.x,
          y: this.mainPlayer.body.y,
          rotation: this.mainPlayer.body.rotation,
          velocity: {
            x: this.mainPlayer.body.velocity.x,
            y: this.mainPlayer.body.velocity.y
          }
        },
        scale: {
          y: this.mainPlayer.scale.y
        },
        timestamp: Date.now()
      };
      Multiplayer.socket.emit('playerAction', state);
    }
  },
  controlOther: function(playerData) {
    this.others[playerData.id].body.x = playerData.body.x,
    this.others[playerData.id].body.y = playerData.body.y,
    this.others[playerData.id].body.velocity.x = playerData.body.velocity.x,
    this.others[playerData.id].body.velocity.x = playerData.body.velocity.y,
    this.others[playerData.id].body.rotation = playerData.body.rotation,
    this.others[playerData.id].scale.y = playerData.scale.y;
    this.repositionUsernameTag(this.others[playerData.id]);
  },
  /**
   * When the main player is in contact with water oxygen is restored
   */
  restoreOxygen: function() {
    this.mainPlayer.oxygen = this.mainPlayer.stats.maxOxygen;
  },

  getRandomSkin: function() {
    return this.skins[Math.floor(Math.random() * this.skins.length)]
  },

  flap: function() {
    if (!Players.mainPlayer.inWater) {
      this.mainPlayer.body.angularVelocity = this.mainPlayer.pointer.worldX > this.mainPlayer.x ? 15 : -15;
      this.mainPlayer.body.velocity.y -= 50;
    }
  },

  controlPlayerDeath: function() {
    setInterval(() => {
      this.mainPlayer.oxygen--;
      if (this.mainPlayer.oxygen === 0) {
        this.mainPlayer.loadTexture('dead');
      }
      if (this.mainPlayer.oxygen === -5) {

        let deadPlayer = game.add.sprite(this.mainPlayer.body.x, this.mainPlayer.body.y, 'dead');
        deadPlayer.anchor.setTo(0.5);
        deadPlayer.rotation = this.mainPlayer.body.rotation;
        this.mainPlayer.body.x = 150;
        this.mainPlayer.body.y = 15500;
        this.mainPlayer.loadTexture(this.getRandomSkin());
        this.mainPlayer.oxygen = this.mainPlayer.stats.maxOxygen;
      }
    }, 1000);

  },
  /**
   * It makes the username tags follow the players as they move around the map
   */
  repositionUsernameTag(player){
    player.username_tag.x = player.x + player.username.x_offset;
    player.username_tag.y = player.y + player.username.y_offset;
  }
}
