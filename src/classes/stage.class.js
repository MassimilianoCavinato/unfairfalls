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

}
