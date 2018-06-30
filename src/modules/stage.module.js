import { game } from './game.module.js';
import { Physics } from './physics.module.js';

export var Stage = {

  spawnPoint: {
    x: 200,
    y: 15500
  },

  createGround: function() {
    Physics.groundGroup = game.add.tileSprite(2000, 8000, 4000, 16000, 'transparent');
    Physics.groundGroup.anchor.setTo(0.5);
    game.physics.p2.enable([Physics.groundGroup], true);
    Physics.groundGroup.body.clearShapes();
    Physics.groundGroup.body.loadPolygon('mapData', 'Ground');
    Physics.groundGroup.body.data.gravityScale = 0;
    Physics.groundGroup.body.static = true;
    Physics.groundGroup.body.setCollisionGroup(Physics.collisionGroup);
    Physics.groundGroup.body.collides(Physics.collisionGroup);
  },

  createWater: function() {
    Physics.waterGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
    let waterData = game.cache.getJSON('jsonData').Water;
    waterData.map(w => {
      let waterTile = game.add.tileSprite(w[0] + (w[2] / 2), w[1] + (w[3] / 2), w[2], w[3], 'water');
      waterTile.anchor.setTo(0.5);
      game.physics.p2.enable([waterTile], false);
      waterTile.body.data.gravityScale = 0;
      waterTile.body.static = true;
      Physics.waterGroup.add(waterTile);
    });
  }
}
