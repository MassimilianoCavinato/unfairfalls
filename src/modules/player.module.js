import { globals } from './../globals.js';
import { game } from './game.module.js';
import { Physics } from './physics.module.js';

export var Player = {
  controlPlayerDeath: function() {
    setInterval(() => {
      globals.oxygen--;
      if (globals.oxygen === 0) {
        globals.player.loadTexture('dead');
      }
      if (globals.oxygen === -5) {
        let deadPlayer = game.add.sprite(3500, 15400, 'dead');
        deadPlayer.anchor.setTo(0.5);
        game.physics.p2.enable([deadPlayer], true);
        deadPlayer.body.clearShapes();
        deadPlayer.body.loadPolygon('charactersData', 'Player');
        deadPlayer.body.setCollisionGroup(globals.collisionGroup);
        deadPlayer.body.collides(globals.collisionGroup);
        deadPlayer.body.rotation = globals.player.body.rotation;
        globals.player.body.x = 150;
        globals.player.body.y = 15500;
        globals.player.loadTexture(this.getRandomSkin());
        globals.oxygen = 15;
      }
    }, 1000);

  },
  addPlayer: function(playerId) {
    //RANDOM SKIN
    let skin = this.getRandomSkin();
    globals.player = game.add.sprite(2200, 14000, skin);
    globals.player.id = playerId;
    globals.player.timestamp = Date.now();
    globals.player.inputEnabled = true;
    globals.player.anchor.setTo(0.5);
    globals.player.events.onInputDown.add(this.flap, this);
    game.physics.p2.enable([globals.player], false);
    globals.player.body.clearShapes();
    globals.player.body.loadPolygon('charactersData', 'Player');
    globals.player.body.setCollisionGroup(globals.collisionGroup);
    globals.player.body.collides(globals.collisionGroup);
    game.camera.follow(globals.player);
    game.physics.p2.createSpring(globals.player, globals.pointer, 20, 10, 1);
  },
  getRandomSkin: function() {
    return globals.skins[Math.floor(Math.random() * globals.skins.length)]
  },
  flap: function() {
    if (!globals.inWater) {
      globals.player.body.angularVelocity = globals.pointer.worldX > globals.player.x ? 15 : -15;
      globals.player.body.velocity.y -= 50;
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
    otherPlayer.body.setCollisionGroup(globals.collisionGroup);
    otherPlayer.body.collides(globals.collisionGroup);
    otherPlayer.body.data.gravityScale = 0;
    globals.otherPlayers.add(otherPlayer);
    //megahack, not sure if it is reliable, need to check what happens when player is destroyed on disconnection
    globals.otherPlayersRef[playerId] = globals.otherPlayers.children.length - 1;
  },
  restoreOxygen: function() {
    globals.oxygen = 30;
  },
  controlPlayer: function() {
    if (Object.keys(globals.player).length > 1) {
      Physics.isInWater() ? Physics.waterPhysics() : Physics.airPhysics();
      /*
          The state object below is a snapshot of the player sent with web socket which will be then broadcasted to all other players.
          This will probably change down the line, I don't think that all this data is necessary.
          Also, this data should be encoded client side and decoded server side to make TCP traffic faster.
      */

      let state = {
        id: globals.player.id,
        body: {
          x: globals.player.body.x,
          y: globals.player.body.y,
          rotation: globals.player.body.rotation,
          velocity: {
            x: globals.player.body.velocity.x,
            y: globals.player.body.velocity.y
          }
        },
        scale: {
          y: globals.player.scale.y
        },
        timestamp: Date.now()
      };
      globals.socket.emit('playerAction', state);
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
