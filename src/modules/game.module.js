import { Stage } from './stage.module.js';
import { Player } from './player.module.js';
import { Multiplayer } from './multiplayer.module.js';
import { Physics } from './physics.module.js';

var conf = {
  width: 1600,
  height: 900,
  renderer: Phaser.CANVAS,
  parent: 'unfairfalls',
  state: {
    preload: function() {

      game.load.image('skin0', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin0.png');
      game.load.image('skin1', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin1.png');
      game.load.image('skin2', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin2.png');
      game.load.image('skin3', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin3.png');
      game.load.image('dead', 'https://unfairfalls.herokuapp.com/assets/img/skins/dead.png');
      game.load.image('transparent', 'https://unfairfalls.herokuapp.com/assets/img/transparent.png');
      game.load.image('water', 'https://unfairfalls.herokuapp.com/assets/img/water.png');
      game.load.image('grid', 'https://unfairfalls.herokuapp.com/assets/img/grid.png');

      //PHYSICS DATA
      game.load.physics('mapData', 'assets/physicsData/map.json');
      game.load.json('jsonData', 'assets/physicsData/map.json');
      game.load.physics('charactersData', 'assets/physicsData/characters.json');

    },
    create: function() {
      Multiplayer.initConnection();
      game.physics.startSystem(Phaser.Physics.P2JS);
      game.world.setBounds(0, 0, 4000, 16000);
      game.physics.p2.gravity.y = 900;
      game.stage.disableVisibilityChange = true;
      Player.pointer = game.input.activePointer;
      Physics.collisionGroup = game.physics.p2.createCollisionGroup();
      game.add.tileSprite(0, 0, 4000, 16000, 'grid');
      Stage.createWater();
      Stage.createGround();
      Multiplayer.handleSockets();
      Player.controlPlayerDeath();
      Player.otherPlayers = game.add.physicsGroup(Phaser.Physics.P2JS);
    },

    update: function() {
      //should find a way to remove this check at each update
      return typeof (Player.player) !== 'undefined' ? Player.controlPlayer() : null;
    },

    render: function() {
      let text;
      if (Player.oxygen <= 0) {
        text = "You are dead :( , respawn in " + (5 + Player.oxygen).toString() + " seconds";
      } else {
        text = "Oxygen : " + Player.oxygen.toString();
      }
      game.debug.text(text, 32, 30);

    }
  },
  transparent: false,
  antialias: true,
  scaleMode: Phaser.ScaleManager.RESIZE,
  forceLandscape: true
};

//init phaser game
export var game = new Phaser.Game(conf);
