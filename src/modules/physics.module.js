import { globals } from './../globals.js';
import { Player } from './player.module.js';
import { game } from './game.module.js';

export var Physics = {
  isInWater: function() {
    return globals.waterGroup.children.some(function(waterSprite) {
      return globals.player.overlap(waterSprite) === true;
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

    let pointerDistance = Math.sqrt(Math.pow(globals.pointer.worldX - globals.player.body.x, 2) + Math.pow(globals.pointer.worldY - globals.player.body.y, 2));
    globals.player.body.data.gravityScale = 0;
    globals.player.scale.y = globals.pointer.worldX < globals.player.x ? -Math.abs(globals.player.scale.y) : Math.abs(globals.player.scale.y);

    if (pointerDistance > 100) {

      let forceAngle = Math.atan2(globals.pointer.worldY - globals.player.body.y, globals.pointer.worldX - globals.player.body.x);
      globals.player.body.force.x = Math.cos(forceAngle) * 7500;
      globals.player.body.force.y = Math.sin(forceAngle) * 7500;


      if (globals.player.body.velocity.y > globals.maxSpeed) {
        globals.player.body.velocity.y = globals.maxSpeed;
      }
      if (globals.player.body.velocity.y < -globals.maxSpeed) {
        globals.player.body.velocity.y = -globals.maxSpeed;
      }
      if (globals.player.body.velocity.x > globals.maxSpeed) {
        globals.player.body.velocity.x = globals.maxSpeed;
      }
      if (globals.player.body.velocity.x < -globals.maxSpeed) {
        globals.player.body.velocity.x = -globals.maxSpeed;
      }

      globals.player.body.rotation = Math.atan2(globals.player.body.velocity.y, globals.player.body.velocity.x)
    } else if (pointerDistance > 50) {
      globals.player.body.rotation = Math.atan2(globals.pointer.worldY - globals.player.body.y, globals.pointer.worldX - globals.player.body.x);
      game.physics.arcade.moveToXY(globals.player, globals.pointer.worldX, globals.pointer.worldY, 250);
      globals.player.body.damping = 0.99;
    } else {
      globals.player.body.speed = 0;
      globals.player.body.angularVelocity = 0;
      globals.player.body.damping = 0.95;
    }

  },
  airPhysics: function() {
    /*  ========================================================================
        AIR PHYSICS
        ========================================================================
        Player is affected by game gravity
        He can still angle in direction of the pointer but shouldn't have any control whatsoever the direction and speed.
    */
    let pointerDistance = Math.sqrt(Math.pow(globals.pointer.worldX - globals.player.body.x, 2) + Math.pow(globals.pointer.worldY - globals.player.body.y, 2));
    globals.player.body.data.gravityScale = 1;
    globals.player.body.damping = 0;
    globals.player.body.speed = 0;
    globals.player.scale.y = globals.pointer.worldX < globals.player.x ? -Math.abs(globals.player.scale.y) : Math.abs(globals.player.scale.y);

  }
}
