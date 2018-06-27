import Player from 'classes/player.class';
import Stage from 'classes/stage.class';
import phaserConf from 'phaser-conf';


export default class Game {
  constructor() {
    this.phaserGameInstance = new Phaser.Game(phaserConf);
    this.players = [];
    this.mainPlayer = null;
    this.stage = null;
  }

  createStage() {
    this.stage = new Stage(this.phaserGameInstance);
  }

  addPlayer(playerId, isMainPlayer) {
    this.players[playerId] = new Player(this.phaserGameInstance, playerId);
    let playerSprite = this.players[playerId].getInstance();

    this.phaserGameInstance.physics.p2.enable([playerSprite], false);
    this.phaserGameInstance.physics.p2.createSpring(playerSprite, phaserGameInstance.input.activePointer, 20, 10, 1);

    if (isMainPlayer) {
      this.mainPlayer = this.players[playerId];
      this.phaserGameInstance.camera.follow(playerSprite);
    }
  }

  removePlayer(playerId) {
    let playerIds = Object.Keys(this.players);
    if (playerIds.indexOf(playerId) !== -1 && this.mainPlayer.getInstance.id !== playerId) {
      this.players.splice(playerIds.indexOf(playerId), 1);
    }
  }

  isMainPlayerInWater() {
    inWater = this.stage.waterMatrixInstance.children.some(function(waterSprite) {
      return this.mainPlayer.overlap(waterSprite) === true;
    });
  }

  waterPhysics() {

    /*  ========================================================================
        WATER PHYSICS
        ========================================================================
        No gravity
        Water friction ( body.damping )
        Player moves in direction of the pointer
        The bigger is the distance from the pointer and the faseter he moves, up to 800 max speed
        When the pointer is close to the player, the sprite should stop smoothly and stop angling to avoid shaky animation
    */

    oxygen = 100;
    let pointerDistance = Math.sqrt(Math.pow(pointer.worldX - player.body.x, 2) + Math.pow(pointer.worldY - player.body.y, 2));
    player.body.data.gravityScale = 0;
    player.scale.y = pointer.worldX < player.x ? -Math.abs(player.scale.y) : Math.abs(player.scale.y);

    if (pointerDistance > 100) {

      let forceAngle = Math.atan2(pointer.worldY - player.body.y, pointer.worldX - player.body.x);
      player.body.force.x = Math.cos(forceAngle) * 7500;
      player.body.force.y = Math.sin(forceAngle) * 7500;


      if (player.body.velocity.y > maxSpeed) {
        player.body.velocity.y = maxSpeed;
      }
      if (player.body.velocity.y < -maxSpeed) {
        player.body.velocity.y = -maxSpeed;
      }
      if (player.body.velocity.x > maxSpeed) {
        player.body.velocity.x = maxSpeed;
      }
      if (player.body.velocity.x < -maxSpeed) {
        player.body.velocity.x = -maxSpeed;
      }

      player.body.rotation = Math.atan2(player.body.velocity.y, player.body.velocity.x)
    } else if (pointerDistance > 50) {
      player.body.rotation = Math.atan2(pointer.worldY - player.body.y, pointer.worldX - player.body.x);
      game.physics.arcade.moveToXY(player, pointer.worldX, pointer.worldY, 250);
      player.body.damping = 0.99;
    } else {
      player.body.speed = 0;
      player.body.angularVelocity = 0;
      player.body.damping = 0.95;
    }
  }

  airPhysics() {
    /*  ========================================================================
        AIR PHYSICS
        ========================================================================
        Player is affected by game gravity
        He can still angle in direction of the pointer but shouldn't have any control whatsoever the direction and speed.
    */

    let pointerDistance = Math.sqrt(Math.pow(pointer.worldX - player.body.x, 2) + Math.pow(pointer.worldY - player.body.y, 2));
    player.body.data.gravityScale = 1;
    player.body.damping = 0;
    player.body.speed = 0;
    player.scale.y = pointer.worldX < player.x ? -Math.abs(player.scale.y) : Math.abs(player.scale.y);
  }

}
