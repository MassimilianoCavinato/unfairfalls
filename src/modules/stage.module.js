import { game } from './game.module.js';
import { globals } from './../globals.js';

export var Stage = {
  createGround: function() {
    globals.ground = game.add.tileSprite(2000, 8000, 4000, 16000, 'transparent');
    globals.ground.anchor.setTo(0.5);
    game.physics.p2.enable([globals.ground], true);
    globals.ground.body.clearShapes();
    globals.ground.body.loadPolygon('mapData', 'Ground');
    globals.ground.body.data.gravityScale = 0;
    globals.ground.body.static = true;
    globals.ground.body.setCollisionGroup(globals.collisionGroup);
    globals.ground.body.collides(globals.collisionGroup);
  },
  createWater: function() {
    globals.waterGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
    let waterData = game.cache.getJSON('jsonData').Water;
    waterData.map(w => {
      let waterTile = game.add.tileSprite(w[0] + (w[2] / 2), w[1] + (w[3] / 2), w[2], w[3], 'water');
      waterTile.anchor.setTo(0.5);
      game.physics.p2.enable([waterTile], false);
      waterTile.body.data.gravityScale = 0;
      waterTile.body.static = true;
      globals.waterGroup.add(waterTile);
    });
  }
}
