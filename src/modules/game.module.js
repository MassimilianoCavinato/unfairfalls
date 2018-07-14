import { Stage } from './stage.module.js';
import { Players } from './players.module.js';
import { Multiplayer } from './multiplayer.module.js';
import { Physics } from './physics.module.js';
var username = document.getElementById('username').value.substring(0,11);
if(username.trim() === ""){
  username = 'sillysalmon';
}
var skin = $('#skin').data('ddslick').selectedData.value;
document.getElementById('unfairfalls').innerHTML = '';

var conf = {
  width: 900,
  height: 500,
  renderer: Phaser.CANVAS,
  parent: 'unfairfalls',
  transparent: false,
  antialias: true,
  scaleMode: Phaser.ScaleManager.EXACT_FIT,
  state: {
    preload: function() {
      this.load.image('test', 'https://unfairfalls.herokuapp.com/assets/img/test.png');
      this.load.image('skin0', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin0.png');
      this.load.image('skin1', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin1.png');
      this.load.image('skin2', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin2.png');
      this.load.image('skin3', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin3.png');
      this.load.image('dead', 'https://unfairfalls.herokuapp.com/assets/img/skins/dead.png');
      this.load.image('transparent', 'https://unfairfalls.herokuapp.com/assets/img/transparent.png');
      this.load.image('water', 'https://unfairfalls.herokuapp.com/assets/img/water.png');
      this.load.image('grid', 'https://unfairfalls.herokuapp.com/assets/img/grid.png');
      this.load.physics('mapData', 'assets/physicsData/map.json');
      this.load.json('jsonData', 'assets/physicsData/map.json');
      this.load.physics('charactersData', 'assets/physicsData/characters.json');

    },
    create: function() {

      Multiplayer.initConnection(username, skin);
      this.physics.startSystem(Phaser.Physics.P2JS);
      this.world.setBounds(0, 0, 4000, 16000);
      this.physics.p2.gravity.y = 900;
      this.stage.disableVisibilityChange = true;
      game.camera.scale.set(0.6,0.6);
      Physics.collisionGroup = this.physics.p2.createCollisionGroup();
      Stage.createGrid();
      Stage.createWater();
      Stage.createLandscape();
      Stage.createGround();
      Multiplayer.handleSockets();
      Players.otherPlayers = this.add.physicsGroup(Phaser.Physics.P2JS);
    },
    update: function() {
      //should find a way to remove this check at each update
      return typeof (Players.mainPlayer) !== 'undefined' ? Players.controlMain() : null;
    },
    render: function() {

      let debug_oxygen;

      if(typeof Players.mainPlayer.oxygen !== 'undefined'){

        if (Players.mainPlayer.oxygen <= 0) {
          debug_oxygen = "You are dead :( , respawn in " + (5 + Players.mainPlayer.oxygen).toString() + " seconds";
        } else {
          debug_oxygen = "Oxygen : " + Players.mainPlayer.oxygen.toString();
        }
        game.debug.text(debug_oxygen, 32, 30);
        game.debug.text("Best score : "+Players.mainPlayer.score.toString(), 32, 60);
      }
    }


  },
};

export var game = new Phaser.Game(conf);
