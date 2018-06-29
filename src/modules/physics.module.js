import { Player } from './player.module.js';
import { game } from './game.module.js';

export var Physics = {
  collisionGroup: {},
  waterGroup: {},
  groundGroup: {},
  isInWater: function() {
    return Physics.waterGroup.children.some(function(waterSprite) {
      return Player.player.overlap(waterSprite) === true;
    });
  },
  waterPhysics: function() {
    /*
    I m a fish - I m supposed to breath in the water
    */
    Player.restoreOxygen();

    /*  ========================================================================
        WATER PHYSICS
        ========================================================================
        No gravity
        Water friction ( body.damping )
        Player moves in direction of the pointer
        The bigger is the distance from the pointer and the faseter he moves, up to 800 max speed
        When the pointer is close to the player, the sprite should stop smoothly and stop angling to avoid shaky animation
    */

    let pointerDistance = Math.sqrt(Math.pow(Player.pointer.worldX - Player.player.body.x, 2) + Math.pow(Player.pointer.worldY - Player.player.body.y, 2));
    Player.player.body.data.gravityScale = 0;
    Player.player.scale.y = Player.pointer.worldX < Player.player.x ? -Math.abs(Player.player.scale.y) : Math.abs(Player.player.scale.y);

    if (pointerDistance > 100) {

      let forceAngle = Math.atan2(Player.pointer.worldY - Player.player.body.y, Player.pointer.worldX - Player.player.body.x);
      Player.player.body.force.x = Math.cos(forceAngle) * 7500;
      Player.player.body.force.y = Math.sin(forceAngle) * 7500;


      if (Player.player.body.velocity.y > Player.maxSpeed) {
        Player.player.body.velocity.y = Player.maxSpeed;
      }
      if (Player.player.body.velocity.y < -Player.maxSpeed) {
        Player.player.body.velocity.y = -Player.maxSpeed;
      }
      if (Player.player.body.velocity.x > Player.maxSpeed) {
        Player.player.body.velocity.x = Player.maxSpeed;
      }
      if (Player.player.body.velocity.x < -Player.maxSpeed) {
        Player.player.body.velocity.x = -Player.maxSpeed;
      }

      Player.player.body.rotation = Math.atan2(Player.player.body.velocity.y, Player.player.body.velocity.x)
    } else if (pointerDistance > 50) {
      Player.player.body.rotation = Math.atan2(Player.pointer.worldY - Player.player.body.y, Player.pointer.worldX - Player.player.body.x);
      game.physics.arcade.moveToXY(Player.player, Player.pointer.worldX, Player.pointer.worldY, 250);
      Player.player.body.damping = 0.99;
    } else {
      Player.player.body.speed = 0;
      Player.player.body.angularVelocity = 0;
      Player.player.body.damping = 0.95;
    }

  },
  airPhysics: function() {
    /*  ========================================================================
        AIR PHYSICS
        ========================================================================
        Player is affected by game gravity
        He can still angle in direction of the pointer but shouldn't have any control whatsoever the direction and speed.
    */
    let pointerDistance = Math.sqrt(Math.pow(Player.pointer.worldX - Player.player.body.x, 2) + Math.pow(Player.pointer.worldY - Player.player.body.y, 2));
    Player.player.body.data.gravityScale = 1;
    Player.player.body.damping = 0;
    Player.player.body.speed = 0;
    Player.player.scale.y = Player.pointer.worldX < Player.player.x ? -Math.abs(Player.player.scale.y) : Math.abs(Player.player.scale.y);

  }
}
