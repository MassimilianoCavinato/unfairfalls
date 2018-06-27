export default class Stage {
  constructor(phaserGameInstance) {
    this.game = phaserGameInstance;
    this.groundSpriteInstance = null,
    this.waterMatrixInstance = null;

    this.createGround();
    this.createWater();

  }

  createGround() {
    this.groundSpriteInstance = this.game.add.tileSprite(2000, 8000, 4000, 16000, 'transparent');
    this.groundSpriteInstance.anchor.setTo(0.5);
    this.groundSpriteInstance.body.clearShapes();
    this.groundSpriteInstance.body.loadPolygon('mapData', 'Ground');
    this.groundSpriteInstance.body.data.gravityScale = 0;
    this.groundSpriteInstance.body.static = true;
    this.groundSpriteInstance.body.setCollisionGroup(collisionGroup);
    this.groundSpriteInstance.body.collides(collisionGroup);

    this.game.physics.p2.enable([this.groundSpriteInstance], true);

  }

  createWater() {
    this.waterMatrixInstance = this.game.add.physicsGroup(Phaser.Physics.P2JS);
    let waterData = this.game.cache.getJSON('jsonData').Water;
    waterData.map(w => {
      let waterTile = this.game.add.tileSprite(w[0] + (w[2] / 2), w[1] + (w[3] / 2), w[2], w[3], 'water');
      waterTile.anchor.setTo(0.5);
      this.game.physics.p2.enable([waterTile], false);
      waterTile.body.data.gravityScale = 0;
      waterTile.body.static = true;
      this.waterMatrixInstance.add(waterTile);
    });
  }

  /*  ========================================================================
      WATER PHYSICS
      ========================================================================
      No gravity
      Water friction ( body.damping )
      Player moves in direction of the pointer
      The bigger is the distance from the pointer and the faseter he moves, up to 800 max speed
      When the pointer is close to the player, the sprite should stop smoothly and stop angling to avoid shaky animation
  */
  waterPhysics() {
    let pointerDistance = Math.sqrt(Math.pow(this.game.input.activePointer.worldX - this.mainPlayer.body.x, 2) + Math.pow(this.game.input.activePointer.worldY - this.mainPlayer.body.y, 2));
    this.mainPlayer.body.data.gravityScale = 0;
    this.mainPlayer.scale.y = this.game.input.activePointer.worldX < this.mainPlayer.x ? -Math.abs(this.mainPlayer.scale.y) : Math.abs(this.mainPlayer.scale.y);

    if (pointerDistance > 100) {

      let forceAngle = Math.atan2(this.game.input.activePointer.worldX - this.mainPlayer.body.y, this.game.input.activePointer.worldX - this.mainPlayer.body.x);
      this.mainPlayer.body.force.x = Math.cos(forceAngle) * 7500;
      this.mainPlayer.body.force.y = Math.sin(forceAngle) * 7500;


      if (this.mainPlayer.body.velocity.y > maxSpeed) {
        this.mainPlayer.body.velocity.y = maxSpeed;
      }
      if (this.mainPlayer.body.velocity.y < -maxSpeed) {
        this.mainPlayer.body.velocity.y = -maxSpeed;
      }
      if (this.mainPlayer.body.velocity.x > maxSpeed) {
        this.mainPlayer.body.velocity.x = maxSpeed;
      }
      if (this.mainPlayer.body.velocity.x < -maxSpeed) {
        this.mainPlayer.body.velocity.x = -maxSpeed;
      }

      this.mainPlayer.body.rotation = Math.atan2(this.mainPlayer.body.velocity.y, this.mainPlayer.body.velocity.x)
    } else if (pointerDistance > 50) {
      this.mainPlayer.body.rotation = Math.atan2(this.game.input.activePointer.worldY - this.mainPlayer.body.y, this.game.input.activePointer.worldX - this.mainPlayer.body.x);
      this.game.physics.arcade.moveToXY(this.mainPlayer, this.game.input.activePointer.worldX, this.game.input.activePointer.worldY, 250);
      this.mainPlayer.body.damping = 0.99;
    } else {
      this.mainPlayer.body.speed = 0;
      this.mainPlayer.body.angularVelocity = 0;
      this.mainPlayer.body.damping = 0.95;
    }
  }

  /*  ========================================================================
    AIR PHYSICS
    ========================================================================
    Player is affected by game gravity
    He can still angle in direction of the pointer but shouldn't have any control whatsoever the direction and speed.
  */
  airPhysics() {
    let pointerDistance = Math.sqrt(Math.pow(this.game.input.activePointer.worldX - this.mainPlayer.body.x, 2) + Math.pow(this.game.input.activePointer.worldY - this.mainPlayer.body.y, 2));
    this.mainPlayer.body.data.gravityScale = 1;
    this.mainPlayer.body.damping = 0;
    this.mainPlayer.body.speed = 0;
    this.mainPlayer.scale.y = this.game.input.activePointer.worldX < this.mainPlayer.x ? -Math.abs(this.mainPlayer.scale.y) : Math.abs(this.mainPlayer.scale.y);
  }

}
