import { Players } from './players.module.js';
import { game } from './game.module.js';

export var Physics = {
  collisionGroup: {},
  waterGroup: {},
  groundGroup: {},
  isInWater: function() {
    return Physics.waterGroup.children.some(function(waterSprite) {
      return Players.mainPlayer.overlap(waterSprite) === true;
    });
  },
  waterPhysics: function() {
    /*
    I m a fish - I m supposed to breath in the water
    */
    Players.restoreOxygen();

    /*  ========================================================================
        WATER PHYSICS
        ========================================================================
        No gravity
        Water friction ( body.damping )
        Player moves in direction of the pointer
        The bigger is the distance from the pointer and the faseter he moves, up to 800 max speed
        When the pointer is close to the player, the sprite should stop smoothly and stop angling to avoid shaky animation
    */
    let pointerX = game.input.activePointer.worldX * (1/game.world.scale.x);
    let pointerY = game.input.activePointer.worldY * (1/game.world.scale.y);

    let pointerDistance = Math.sqrt(Math.pow(pointerX - Players.mainPlayer.body.x, 2) + Math.pow(pointerY - Players.mainPlayer.body.y, 2));
    Players.mainPlayer.body.data.gravityScale = 0;

    if (pointerDistance > 100) {
      this.controlSpriteScaleY();
      let forceAngle = Math.atan2(pointerY - Players.mainPlayer.body.y, pointerX - Players.mainPlayer.body.x);
      Players.mainPlayer.body.force.x = Math.cos(forceAngle) * Players.mainPlayer.stats.maxForce;
      Players.mainPlayer.body.force.y = Math.sin(forceAngle) * Players.mainPlayer.stats.maxForce;

      if (Players.mainPlayer.body.velocity.y > Players.mainPlayer.stats.maxSpeed) {
        Players.mainPlayer.body.velocity.y = Players.mainPlayer.stats.maxSpeed;
      }
      if (Players.mainPlayer.body.velocity.y < -Players.mainPlayer.stats.maxSpeed) {
        Players.mainPlayer.body.velocity.y = -Players.mainPlayer.stats.maxSpeed;
      }
      if (Players.mainPlayer.body.velocity.x > Players.mainPlayer.stats.maxSpeed) {
        Players.mainPlayer.body.velocity.x = Players.mainPlayer.stats.maxSpeed;
      }
      if (Players.mainPlayer.body.velocity.x < -Players.mainPlayer.stats.maxSpeed) {
        Players.mainPlayer.body.velocity.x = -Players.mainPlayer.stats.maxSpeed;
      }

      Players.mainPlayer.body.rotation = Math.atan2(Players.mainPlayer.body.velocity.y, Players.mainPlayer.body.velocity.x)
    } else if (pointerDistance > 50) {
      this.controlSpriteScaleY();
      Players.mainPlayer.body.rotation = Math.atan2(pointerY - Players.mainPlayer.body.y, pointerX - Players.mainPlayer.body.x);
      game.physics.arcade.moveToXY(Players.mainPlayer, pointerX, pointerY, 250);
      Players.mainPlayer.body.damping = 0.99;
    } else {
      Players.mainPlayer.body.speed = 0;
      Players.mainPlayer.body.angularVelocity = 0;
      Players.mainPlayer.body.damping = 0.99;
    }

  },
  airPhysics: function() {
    /*  ========================================================================
        AIR PHYSICS
        ========================================================================
        Player is affected by game gravity
        He can still angle in direction of the pointer but shouldn't have any control whatsoever the direction and speed.
    */
    let pointerDistance = Math.sqrt(Math.pow(Players.mainPlayer.pointer.worldX - Players.mainPlayer.body.x, 2) + Math.pow(Players.mainPlayer.pointer.worldY - Players.mainPlayer.body.y, 2));
    Players.mainPlayer.body.data.gravityScale = 1;
    Players.mainPlayer.body.damping = 0;
    Players.mainPlayer.body.speed = 0;
    Players.mainPlayer.scale.y = Players.mainPlayer.pointer.worldX < Players.mainPlayer.x ? -Math.abs(Players.mainPlayer.scale.y) : Math.abs(Players.mainPlayer.scale.y);

  },
  controlSpriteScaleY: function(){
      Players.mainPlayer.scale.y = Players.mainPlayer.pointer.worldX < Players.mainPlayer.x ? -Math.abs(Players.mainPlayer.scale.y) : Math.abs(Players.mainPlayer.scale.y);
  }
}
