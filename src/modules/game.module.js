import { Stage } from './stage.module.js';
import { Players } from './players.module.js';
import { Multiplayer } from './multiplayer.module.js';
import { Physics } from './physics.module.js';
var username = document.getElementById('username').value.substring(0,12);
if(username.trim() === ""){
  username = 'Unknown '+Math.floor(Math.random() * 100).toString(); 
}
var skin = document.getElementById('skin').value;

document.getElementById('unfairfalls').innerHTML = '';

var conf = {
  width: 1600,
  height: 900,
  renderer: Phaser.CANVAS,
  parent: 'unfairfalls',
  transparent: false,
  antialias: true,
  state: {
    preload: function() {

      //IMAGE DATA
      this.load.image('skin0', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin0.png');
      this.load.image('skin1', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin1.png');
      this.load.image('skin2', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin2.png');
      this.load.image('skin3', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin3.png');
      this.load.image('dead', 'https://unfairfalls.herokuapp.com/assets/img/skins/dead.png');
      this.load.image('transparent', 'https://unfairfalls.herokuapp.com/assets/img/transparent.png');
      this.load.image('water', 'https://unfairfalls.herokuapp.com/assets/img/water.png');
      this.load.image('grid', 'https://unfairfalls.herokuapp.com/assets/img/grid.png');

      //PHYSICS DATA
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
      Physics.collisionGroup = this.physics.p2.createCollisionGroup();
      this.add.tileSprite(0, 0, 4000, 16000, 'grid');
      Stage.createWater();
      Stage.createGround();
      Multiplayer.handleSockets();
      Players.otherPlayers = this.add.physicsGroup(Phaser.Physics.P2JS);
    },

    update: function() {
      //should find a way to remove this check at each update
      return typeof (Players.mainPlayer) !== 'undefined' ? Players.controlMain() : null;
    },

    render: function() {
      let debug_text;
      if(typeof Players.mainPlayer.oxygen !== 'undefined'){
        if (Players.mainPlayer.oxygen <= 0) {
          debug_text = "You are dead :( , respawn in " + (5 + Players.mainPlayer.oxygen).toString() + " seconds";
        } else {
          debug_text = "Oxygen : " + Players.mainPlayer.oxygen.toString();
        }
        game.debug.text(debug_text, 32, 30);
      }
    },
  },
};

export var game = new Phaser.Game(conf);
