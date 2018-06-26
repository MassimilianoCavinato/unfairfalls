var conf = {
   width: 1600,
   height: 900,
   renderer: Phaser.CANVAS,
   parent: 'unfairfalls',
   state: this,
   transparent: false,
   antialias: true,
   scaleMode: Phaser.ScaleManager.RESIZE,
   forceLandscape: true
};

var game = new Phaser.Game(conf);

var pointer;
var player;
var otherPlayers;
var collisionGroup;
var waterGroup;
var otherPlayersRef = {};
var ground;
var maxSpeed = 750;
var oxygen = 15;
var inWater = false;
var skins = ['skin0','skin1','skin2','skin3'];

function preload(){

    game.load.image('skin0', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin0.png');
    game.load.image('skin1', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin1.png');
    game.load.image('skin2', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin2.png');
    game.load.image('skin3', 'https://unfairfalls.herokuapp.com/assets/img/skins/skin3.png');
    game.load.image('dead', 'https://unfairfalls.herokuapp.com/assets/img/skins/dead.png');
    game.load.image('transparent', 'https://unfairfalls.herokuapp.com/assets/img/transparent.png');
    game.load.image('water', 'http://localhost:5000/assets/img/water.png');
    game.load.image('grid', 'https://unfairfalls.herokuapp.com/assets/img/grid.png');

    //PHYSICS DATA
    game.load.physics('mapData', 'assets/physicsData/map.json');
    game.load.json('jsonData', 'assets/physicsData/map.json');
    game.load.physics('charactersData', 'assets/physicsData/characters.json');

}

function create(){

    socket = io();
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.world.setBounds(0, 0, 4000, 16000);
    game.physics.p2.gravity.y = 900;
    game.stage.disableVisibilityChange = true;
    pointer = game.input.activePointer;
    collisionGroup = game.physics.p2.createCollisionGroup();
    game.add.tileSprite(0, 0, 4000, 16000, 'grid');
    createWater();
    createGround();
    handleSockets();
    controlPlayerDeath();
    otherPlayers = game.add.physicsGroup(Phaser.Physics.P2JS);
}

function update(){
    //should find a way to remove this check at each update
    if(typeof(player) !== 'undefined'){
      if(player.alive){
          controlPlayer();
      }
    }
}

function render() {
    let text;
    if(oxygen <= 0){
      text = "You are dead :( , respawn in " + (5+oxygen).toString() + " seconds";
    }else{
      text = "Oxygen : "+oxygen.toString();
    }
    game.debug.text(text, 32, 30);

}

function createGround(){
  ground = game.add.tileSprite(2000, 8000, 4000, 16000, 'transparent');
  ground.anchor.setTo(0.5);
  game.physics.p2.enable([ ground ], true);
  ground.body.clearShapes();
  ground.body.loadPolygon('mapData', 'Ground');
  ground.body.data.gravityScale = 0;
  ground.body.static = true;
  ground.body.setCollisionGroup(collisionGroup);
  ground.body.collides(collisionGroup);
}

function createWater(){
  waterGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
  let waterData = game.cache.getJSON('jsonData').Water;
  waterData.map( w => {
    let waterTile = game.add.tileSprite(w[0]+(w[2]/2), w[1]+(w[3]/2), w[2], w[3], 'water');
    waterTile.anchor.setTo(0.5);
    game.physics.p2.enable([ waterTile ], false);
    waterTile.body.data.gravityScale = 0;
    waterTile.body.static = true;
    waterGroup.add(waterTile);
  });
}

function controlPlayerDeath(){
  setInterval(function(){
    oxygen--;
    if(oxygen === 0){
      player.loadTexture('dead');
    }
    if(oxygen === -5){
      let deadPlayer = game.add.sprite(3500, 15400, 'dead');
      deadPlayer.anchor.setTo(0.5);
      game.physics.p2.enable([ deadPlayer ], true);
      deadPlayer.body.clearShapes();
      deadPlayer.body.loadPolygon('charactersData', 'Player');
      deadPlayer.body.setCollisionGroup(collisionGroup);
      deadPlayer.body.collides(collisionGroup);
      deadPlayer.body.rotation = player.body.rotation;
      player.body.x = 150;
      player.body.y = 15500;

      player.loadTexture(getRandomSkin());
      oxygen = 15;
    }
  }, 1000);

}

function addPlayer(playerId){
    //RANDOM SKIN
    let skin = getRandomSkin();
    player = game.add.sprite(2200, 14000, skin);
    player.id = playerId;
    player.timestamp = Date.now();
    player.inputEnabled = true;
    player.anchor.setTo(0.5);
    player.events.onInputDown.add(flap,this);
    game.physics.p2.enable([ player ], false);
    player.body.clearShapes();
    player.body.loadPolygon('charactersData', 'Player');
    player.body.setCollisionGroup(collisionGroup);
    player.body.collides(collisionGroup);
    game.camera.follow(player);
    game.physics.p2.createSpring(player, pointer, 20, 10, 1);
}

function getRandomSkin(){
    return skins[Math.floor(Math.random()*skins.length)]
}

function flap(){
  if(!inWater){
    player.body.angularVelocity = pointer.worldX > player.x ? 15 : -15;
    player.body.velocity.y -= 50;
  }
}

function addOtherPlayer(playerId){
    let skin = getRandomSkin();
    otherPlayer = game.add.sprite(400, 300, skin);
    otherPlayer.id = playerId;
    otherPlayer.anchor.setTo(0.5);
    game.physics.p2.enable([ otherPlayer ], true);
    otherPlayer.body.clearShapes();
    otherPlayer.body.loadPolygon('charactersData', 'Player');
    otherPlayer.body.setCollisionGroup(collisionGroup);
    otherPlayer.body.collides(collisionGroup);
    otherPlayer.body.data.gravityScale = 0;
    otherPlayers.add(otherPlayer);
     //megahack, not sure if it is reliable, need to check what happens when player is destroyed on disconnection
    otherPlayersRef[playerId] = otherPlayers.children.length -1;
}

function controlPlayer(){

    isInWater();
    inWater ? waterPhysics() : airPhysics();
    /*
        The state object below is a snapshot of the player sent with web socket which will be then broadcasted to all other players.
        This will probably change down the line, I don't think that all this data is necessary.
        Also, this data should be encoded client side and decoded server side to make TCP traffic faster.
    */

    let state = {
        id: player.id,
        body: {
            x: player.body.x,
            y: player.body.y,
            rotation: player.body.rotation,
            velocity: {
                x: player.body.velocity.x,
                y: player.body.velocity.y
            }
        },
        scale: {
            y: player.scale.y
        },
        timestamp: Date.now()
    };
    socket.emit('playerAction', state);

}

function isInWater(){
    inWater = waterGroup.children.some(function(waterSprite){
       return player.overlap(waterSprite) === true;
    });
}

function waterPhysics(){

    /*  ========================================================================
        WATER PHYSICS
        ========================================================================
        No gravity
        Water friction ( body.damping )
        Player moves in direction of the pointer
        The bigger is the distance from the pointer and the faseter he moves, up to 800 max speed
        When the pointer is close to the player, the sprite should stop smoothly and stop angling to avoid shaky animation
    */

    oxygen = 100;
    let pointerDistance = Math.sqrt(Math.pow(pointer.worldX - player.body.x, 2) + Math.pow(pointer.worldY - player.body.y, 2));
    player.body.data.gravityScale = 0;
    player.scale.y = pointer.worldX < player.x ? - Math.abs(player.scale.y) :  Math.abs(player.scale.y);

    if(pointerDistance > 100){

      let forceAngle = Math.atan2(pointer.worldY - player.body.y, pointer.worldX - player.body.x);
      player.body.force.x = Math.cos(forceAngle) * 7500;
      player.body.force.y = Math.sin(forceAngle) * 7500;


      if(player.body.velocity.y > maxSpeed){
        player.body.velocity.y = maxSpeed;
      }
      if(player.body.velocity.y < -maxSpeed){
        player.body.velocity.y = -maxSpeed;
      }
      if(player.body.velocity.x > maxSpeed){
        player.body.velocity.x = maxSpeed;
      }
      if(player.body.velocity.x < -maxSpeed){
        player.body.velocity.x = -maxSpeed;
      }

      player.body.rotation = Math.atan2(player.body.velocity.y, player.body.velocity.x)
    }
    else if(pointerDistance > 50){
      player.body.rotation = Math.atan2(pointer.worldY - player.body.y, pointer.worldX - player.body.x);
      game.physics.arcade.moveToXY(player, pointer.worldX, pointer.worldY, 250);
      player.body.damping = 0.99;
    }
    else{
        player.body.speed = 0;
        player.body.angularVelocity = 0;
        player.body.damping = 0.95;
    }
}

function airPhysics(){
    /*  ========================================================================
        AIR PHYSICS
        ========================================================================
        Player is affected by game gravity
        He can still angle in direction of the pointer but shouldn't have any control whatsoever the direction and speed.
    */

    let pointerDistance = Math.sqrt(Math.pow(pointer.worldX - player.body.x, 2) + Math.pow(pointer.worldY - player.body.y, 2));
    player.body.data.gravityScale = 1;
    player.body.damping = 0;
    player.body.speed = 0;
    player.scale.y = pointer.worldX < player.x ? - Math.abs(player.scale.y) :  Math.abs(player.scale.y);
}

function controlOtherPlayer(otherPlayer, playerData){
    /*
        Todo: create client side game prediction, interpolation etc to create the smoothest experience
    */
    otherPlayer.body.x = playerData.body.x,
    otherPlayer.body.y = playerData.body.y,
    otherPlayer.body.velocity.x = playerData.body.velocity.x,
    otherPlayer.body.velocity.x = playerData.body.velocity.y,
    otherPlayer.body.rotation = playerData.body.rotation,
    otherPlayer.scale.y = playerData.scale.y;
}



function handleSockets(){

    socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (playerId, index) {
            playerId === socket.id ? addPlayer(playerId) : addOtherPlayer(playerId);
        });
    });

    socket.on('playerActionFinished', function (playerData) {
        if(playerData.id !== socket.id){
            controlOtherPlayer(otherPlayers.children[otherPlayersRef[playerData.id]], playerData);
        }
    });

    socket.on('newPlayer', function (playerId) {
        addOtherPlayer(playerId);
    });

    socket.on('disconnect', function (playerId) {
        // otherPlayers.children[otherPlayersRef[playerId]].destroy();
        otherPlayers.children.forEach(function (otherPlayer) {
            if (playerId === otherPlayer.id) {
                otherPlayer.destroy();
            }
        });
    });
}
