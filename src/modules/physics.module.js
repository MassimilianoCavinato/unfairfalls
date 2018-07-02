import { Players } from './players.module.js';
import { game } from './game.module.js';

export var Physics = {

  collisionGroup: {},
  waterGroup: {},
  groundGroup: {},
  getScaledPointer: function(){
    return {x: game.input.activePointer.worldX * (1/game.world.scale.x), y: game.input.activePointer.worldY * (1/game.world.scale.y)};
  },
  isInWater: function() {
    return Physics.waterGroup.children.some(function(waterSprite) {
      return Players.mainPlayer.overlap(waterSprite) === true;
    });
  },
  waterPhysics: function() {
    let pointer = this.getScaledPointer();
    Players.restoreOxygen();
    let pointerDistance = Math.sqrt(Math.pow(pointer.x - Players.mainPlayer.body.x, 2) + Math.pow(pointer.y - Players.mainPlayer.body.y, 2));
    Players.mainPlayer.body.data.gravityScale = 0;
    if (pointerDistance > 100) {
      this.controlSpriteScaleY(pointer);
      let forceAngle = Math.atan2(pointer.y - Players.mainPlayer.body.y, pointer.x - Players.mainPlayer.body.x);
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
      this.controlSpriteScaleY(pointer);
      Players.mainPlayer.body.rotation = Math.atan2(pointer.y - Players.mainPlayer.body.y, pointer.x - Players.mainPlayer.body.x);
      game.physics.arcade.moveToXY(Players.mainPlayer, pointer.x, pointer.y, 250);
      Players.mainPlayer.body.damping = 0.99;
    } else {
      Players.mainPlayer.body.speed = 0;
      Players.mainPlayer.body.angularVelocity = 0;
      Players.mainPlayer.body.damping = 0.99;
    }
  },
  airPhysics: function() {
    let pointer = this.getScaledPointer();
    Players.mainPlayer.body.data.gravityScale = 1;
    Players.mainPlayer.body.damping = 0;
    Players.mainPlayer.body.speed = 0;
    this.controlSpriteScaleY(pointer.x);
  },
  flap: function() {
    let pointer = this.getScaledPointer();
    if (Players.mainPlayer.inWater === false) {
      Players.mainPlayer.body.angularVelocity = pointer.x > Players.mainPlayer.x ? 15 : -15;
      Players.mainPlayer.body.velocity.y -= 50;
    }
  },
  controlSpriteScaleY: function(pointer){
      Players.mainPlayer.scale.y = pointer.x > Players.mainPlayer.x ? 1 : -1;
  }
}
