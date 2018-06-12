var game = new Phaser.Game(
    800,
    600,
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

playerPolyRight = [
    {
        "shape": [
            0,40,
            0,20,
            10,28,
            40,22,
            62,28,
            62,33,
            42,40,
            22,38,
            10,33
        ]
    },
];

function preload(){
    game.load.image('player', 'https://unfairfalls.herokuapp.com/assets/salmon.png');
    game.load.image('background', 'https://unfairfalls.herokuapp.com/assets/grid.png');
    game.load.image('ground', 'http://unfairfalls.herokuapp.com/assets/ground.png');
    game.load.image('water', 'https://unfairfalls.herokuapp.com/assets/water.png');
}

function create(){

    socket = io();
    pointer = game.input.activePointer;
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.world.setBounds(0, 0, 2000, 2000);
    collisionGroup = game.physics.p2.createCollisionGroup();
    game.add.tileSprite(0, 0, 2000, 1000, 'background');
    game.add.tileSprite(0, 1000, 2000, 2000, 'water');
    ground = game.add.tileSprite(700, 700, 200, 20, 'ground');
    game.physics.p2.enable([ ground ], true);
    ground.body.data.gravityScale = 0;
    ground.body.static = true;
    ground.body.setCollisionGroup(collisionGroup);
    ground.body.collides([collisionGroup]);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.gravity.y = 500;
    game.stage.disableVisibilityChange = true;
    otherPlayers = game.add.physicsGroup(Phaser.Physics.P2JS);
    handleSockets();
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
}

function update(){
    //should find a way to remove this check at each update
    if(typeof(player) !== 'undefined'){
        controlPlayer();
    }
}

function addPlayer(playerId){
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.12,0.12);
    player.oldPos = {
        id: socket.id,
        x: 0,
        y: 0,
        cx: 0,
        cy: 0,
        rotation: 0,
        speed: 0
    };
    game.physics.p2.enable([ player ], true);
    player.body.clearShapes();
    player.body.loadPolygon(null, playerPolyRight);
    player.body.collideWorldBounds=true;
    player.body.mass = 10;
    player.id = playerId;
    player.timestamp = Date.now();
    player.body.setCollisionGroup(collisionGroup);
    player.body.collides([collisionGroup]);
    game.camera.follow(player);

}

function addOtherPlayer(playerId){
    otherPlayer = game.add.sprite(400, 300, 'player');
    otherPlayer.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable([ otherPlayer ], true);
    otherPlayer.scale.setTo(0.12,0.12);
    otherPlayer.body.clearShapes();
    otherPlayer.body.loadPolygon(null, playerPolyRight);
    otherPlayer.body.mass = 10;
    otherPlayer.id = playerId;
    otherPlayers.add(otherPlayer);
    otherPlayer.body.setCollisionGroup(collisionGroup);
    otherPlayer.body.collides([collisionGroup]);

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
    player.body.damping = 0.9;
    if(pointerDistance > 40){
        let maxSpeed = 800;
        let speed = pointerDistance*4;
        if(speed > maxSpeed){
            speed = maxSpeed;
        }
        player.scale.y = pointer.worldX < player.x ? - Math.abs(player.scale.y) :  Math.abs(player.scale.y);
        player.body.rotation = game.physics.arcade.angleToPointer(player);
        game.physics.arcade.moveToPointer(player, speed, pointer);
    }
    else{
        player.body.speed = 0;
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
    player.body.rotation = game.physics.arcade.angleToPointer(player);
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
    if(typeof player !== 'undefined'){
        game.debug.spriteInfo(player, 500, 32);
    }
}

function handleSockets(){

    socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (playerId, index) {
            playerId === socket.id ? addPlayer(playerId) : addOtherPlayer(playerId);
        });
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

    socket.on('playerActionFinished', function (playerData) {
        if(playerData.id !== socket.id){
            controlOtherPlayer(otherPlayers.children[otherPlayersRef[playerData.id]], playerData);
        }
    });
}
