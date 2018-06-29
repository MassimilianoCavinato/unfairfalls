import { game } from './game.module.js';
import { Physics } from './physics.module.js';
import { Multiplayer } from './multiplayer.module.js';

export var Player = {
  maxSpeed: 750,
  oxygen: 30,
  inWater: false,
  skins: ['skin0', 'skin1', 'skin2', 'skin3'],
  player: {},
  otherPlayers: {},
  otherPlayersRef: {},
  pointer: {},
  controlPlayerDeath: function() {
    setInterval(() => {
      Player.oxygen--;
      if (Player.oxygen === 0) {
        Player.player.loadTexture('dead');
      }
      if (Player.oxygen === -5) {
        let deadPlayer = game.add.sprite(3500, 15400, 'dead');
        deadPlayer.anchor.setTo(0.5);
        game.physics.p2.enable([deadPlayer], true);
        deadPlayer.body.clearShapes();
        deadPlayer.body.loadPolygon('charactersData', 'Player');
        deadPlayer.body.setCollisionGroup(Physics.collisionGroup);
        deadPlayer.body.collides(Physics.collisionGroup);
        deadPlayer.body.rotation = Player.player.body.rotation;
        Player.player.body.x = 150;
        Player.player.body.y = 15500;
        Player.player.loadTexture(this.getRandomSkin());
        Player.oxygen = 15;
      }
    }, 1000);

  },
  addPlayer: function(playerId) {
    //RANDOM SKIN
    let skin = this.getRandomSkin();
    Player.player = game.add.sprite(2200, 14000, skin);
    Player.player.id = playerId;
    Player.player.timestamp = Date.now();
    Player.player.inputEnabled = true;
    Player.player.anchor.setTo(0.5);
    Player.player.events.onInputDown.add(this.flap, this);
    game.physics.p2.enable([Player.player], false);
    Player.player.body.clearShapes();
    Player.player.body.loadPolygon('charactersData', 'Player');
    Player.player.body.setCollisionGroup(Physics.collisionGroup);
    Player.player.body.collides(Physics.collisionGroup);
    game.camera.follow(Player.player);
    game.physics.p2.createSpring(Player.player, Player.pointer, 20, 10, 1);
  },
  getRandomSkin: function() {
    return Player.skins[Math.floor(Math.random() * Player.skins.length)]
  },
  flap: function() {
    if (!Player.inWater) {
      Player.player.body.angularVelocity = Player.pointer.worldX > Player.player.x ? 15 : -15;
      Player.player.body.velocity.y -= 50;
    }
  },
  addOtherPlayer: function(playerId) {
    let skin = this.getRandomSkin();
    let otherPlayer = game.add.sprite(400, 300, skin);
    otherPlayer.id = playerId;
    otherPlayer.anchor.setTo(0.5);
    game.physics.p2.enable([otherPlayer], true);
    otherPlayer.body.clearShapes();
    otherPlayer.body.loadPolygon('charactersData', 'Player');
    otherPlayer.body.setCollisionGroup(Physics.collisionGroup);
    otherPlayer.body.collides(Physics.collisionGroup);
    otherPlayer.body.data.gravityScale = 0;
    Player.otherPlayers.add(otherPlayer);
    //megahack, not sure if it is reliable, need to check what happens when player is destroyed on disconnection
    Player.otherPlayersRef[playerId] = Player.otherPlayers.children.length - 1;
  },
  restoreOxygen: function() {
    Player.oxygen = 30;
  },
  controlPlayer: function() {
    if (Object.keys(Player.player).length > 1) {
      Physics.isInWater() ? Physics.waterPhysics() : Physics.airPhysics();
      /*
          The state object below is a snapshot of the player sent with web socket which will be then broadcasted to all other players.
          This will probably change down the line, I don't think that all this data is necessary.
          Also, this data should be encoded client side and decoded server side to make TCP traffic faster.
      */

      let state = {
        id: Player.player.id,
        body: {
          x: Player.player.body.x,
          y: Player.player.body.y,
          rotation: Player.player.body.rotation,
          velocity: {
            x: Player.player.body.velocity.x,
            y: Player.player.body.velocity.y
          }
        },
        scale: {
          y: Player.player.scale.y
        },
        timestamp: Date.now()
      };
      Multiplayer.socket.emit('playerAction', state);
    }
  },
  controlOtherPlayer: function(otherPlayer, playerData) {
    /*
        Todo: create client side game prediction, interpolation etc to create the smoothest experience
    */
    otherPlayer.body.x = playerData.body.x,
    otherPlayer.body.y = playerData.body.y,
    otherPlayer.body.velocity.x = playerData.body.velocity.x,
    otherPlayer.body.velocity.x = playerData.body.velocity.y,
    otherPlayer.body.rotation = playerData.body.rotation,
    otherPlayer.scale.y = playerData.scale.y;
  }
}
