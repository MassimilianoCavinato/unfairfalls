var game = new Phaser.Game(
    '100%',
    '100%',
    Phaser.CANVAS,
    document.getElementById('unfairfalls'),
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
);

var pointer;
var player;
var otherPlayers;
var ground;
var collisionGroup;
var otherPlayersRef = {};
var stamina = 200;
var playerMaterial;
var waterMaterial;
var groundMaterial;
var contactMaterial;
function preload(){
    //IMAGES
    game.load.image('player', 'https://unfairfalls.herokuapp.com/assets/salmon.png');
    game.load.image('background', 'https://unfairfalls.herokuapp.com/assets/grid.png');
    game.load.image('ground', 'http://unfairfalls.herokuapp.com/assets/ground.png');
    game.load.image('water', 'https://unfairfalls.herokuapp.com/assets/water.png');

    //PHYSICS & POLYGONS
    game.load.physics('physicsData', 'assets/poly_player.json');
}

function create(){

    socket = io();
    pointer = game.input.activePointer;
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.world.setBounds(0, 0, 2000, 2000);
    // game.physics.p2.setImpactEvents(true);
    game.physics.p2.gravity.y = 600;
    game.stage.disableVisibilityChange = true;

    collisionGroup = game.physics.p2.createCollisionGroup();

    // GROUND
    game.add.tileSprite(0, 0, 2000, 1000, 'background');
    game.add.tileSprite(0, 1000, 2000, 2000, 'water');
    ground = game.add.tileSprite(800, 900, 500, 50, 'ground');
    game.physics.p2.enable([ ground ], true);
    ground.body.data.gravityScale = 0;
    ground.body.static = true;
    ground.body.setCollisionGroup(collisionGroup);
    ground.body.collides(collisionGroup);

    otherPlayers = game.add.physicsGroup(Phaser.Physics.P2JS);
    handleSockets();

}

function update(){
    //should find a way to remove this check at each update
    if(typeof(player) !== 'undefined'){
        controlPlayer();
    }
}

function addPlayer(playerId){

    player = game.add.sprite(game.world.centerX, game.world.centerY+500, 'player');
    player.id = playerId;
    player.timestamp = Date.now();
    player.anchor.setTo(0.5);

    game.physics.p2.enable([ player ], true);


    player.body.clearShapes();
    player.body.loadPolygon('physicsData', 'Player');
    player.body.setCollisionGroup(collisionGroup);
    player.body.collides(collisionGroup);

    game.camera.follow(player);

}

function addOtherPlayer(playerId){

    otherPlayer = game.add.sprite(400, 300, 'player');
    otherPlayer.id = playerId;
    otherPlayer.anchor.setTo(0.5);
    game.physics.p2.enable([ otherPlayer ], true);
    otherPlayer.body.clearShapes();
    otherPlayer.body.loadPolygon('physicsData', 'Player');
    otherPlayer.body.setCollisionGroup(collisionGroup);
    otherPlayer.body.collides(collisionGroup);
    otherPlayer.body.data.gravityScale = 0;
    otherPlayers.add(otherPlayer);

     //megahack, not sure if it is reliable, need to check what happens when player is destroyed on disconnection
    otherPlayersRef[playerId] = otherPlayers.children.length -1;
}

function controlPlayer(){

    // Todo: create method to determine this boolean checking player overlaps with water map-tile
    let inWater = player.body.y > 1050;
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
    let pointerDistance = Math.sqrt(Math.pow(pointer.worldX - player.body.x, 2) + Math.pow(pointer.worldY - player.body.y, 2));
    player.body.data.gravityScale = 0;

    if(pointerDistance > 50){
        let maxSpeed = 700;
        let speed = pointerDistance*3;
        if(speed > maxSpeed){
            speed = maxSpeed;
        }
        player.scale.y = pointer.worldX < player.x ? - Math.abs(player.scale.y) :  Math.abs(player.scale.y);
        player.body.rotation = game.physics.arcade.angleToPointer(player);
        game.physics.arcade.moveToXY(player, pointer.worldX, pointer.worldY, speed);
    }
    else{
        player.body.speed = 0;
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
    // player.body.rotation = game.physics.arcade.angleToPointer(player);
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

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.pointer(pointer);
    // game.debug.pointer(game.input.activePointer);
    // if(typeof player !== 'undefined'){
    //     game.debug.spriteInfo(player, 500, 32);
    // }
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
        otherPlayers.children[otherPlayersRef[playerData.id]].destroy();
        // .forEach(function (otherPlayer) {
        //     if (playerId === otherPlayer.id) {
        //         otherPlayer.destroy();
        //     }
        // });
    });


}
