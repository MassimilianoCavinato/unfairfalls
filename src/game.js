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
var cursor;
var player;
var otherPlayers;
var playerCollisionGroup;
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
    game.load.image('background', 'http://unfairfalls.herokuapp.com/assets/grid.png');
    game.load.image('water', 'http://unfairfalls.herokuapp.com/assets/water.png');
}

function create(){

    socket = io();
    cursor = game.input.mousePointer;
    game.world.setBounds(0, 0, 2000, 2000);
    game.add.tileSprite(0, 0, 2000, 1000, 'background');
    game.add.tileSprite(0, 1000, 2000, 2000, 'water');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.gravity.y = 500;
    game.stage.disableVisibilityChange = true;
    playerCollisionGroup = game.physics.p2.createCollisionGroup();
    otherPlayers = game.add.physicsGroup(Phaser.Physics.P2JS);
    handleSockets();
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
}

function update(){
    console.log(0);
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
    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides([playerCollisionGroup]);
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
    otherPlayer.body.setCollisionGroup(playerCollisionGroup);
    otherPlayer.body.collides([playerCollisionGroup]);
    otherPlayersRef[playerId] = otherPlayers.children.length -1;
}

function controlPlayer(){

    var cx = game.input.activePointer.x+game.camera.x;
    var cy = game.input.mousePointer.y+game.camera.y;
    let pointerDistance = Math.sqrt(Math.pow(cursor.worldX - player.body.x, 2) + Math.pow(cursor.worldY - player.body.y, 2));
    let speed = game.input.activePointer.isDown ? 900 : 450;
    player.body.rotation = game.physics.arcade.angleToPointer(player);
    player.scale.y = cx < player.x ? - Math.abs(player.scale.y) :  Math.abs(player.scale.y);

    if(player.y < 1000){
        player.body.speed = 0;
    }
    else{
        if(pointerDistance > 35){
            game.physics.arcade.moveToXY(player, cx, cy, speed);
        }
        else{
            player.body.velocity.y = 0;
            player.body.velocity.x = 0;
        }
    }

    socket.emit('playerAction', {
        id: player.id,
        x: player.body.x,
        y: player.body.y,
        cx: cx,
        cy: cy,
        speed:  Math.sqrt(Math.pow(player.body.velocity.x, 2) + Math.pow(player.body.velocity.y, 2))
    });
}

function controlOtherPlayer(otherPlayer, playerData){
    otherPlayer.body.x = playerData.x,
    otherPlayer.body.y = playerData.y,
    otherPlayer.body.rotation = game.physics.arcade.moveToXY(otherPlayer, playerData.cx, playerData.cy, playerData.speed);
    otherPlayer.scale.y = playerData.cx < playerData.x ? - Math.abs(otherPlayer.scale.y) :  Math.abs(otherPlayer.scale.y);
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
            playerId === socket.id ? addPlayer(players[playerId].id) : addOtherPlayer(players[playerId].id);
        });
    });

    socket.on('newPlayer', function (playerId) {
        addOtherPlayer(playerId);
    });

    socket.on('disconnect', function (playerId) {
        otherPlayers.children.forEach(function (otherPlayer) {
            if (playerId === otherPlayer.id) {
                otherPlayer.destroy();
            }
        });
    });

    socket.on('playerActionFinished', function (playerData) {
        if(playerData.id !== socket.id){
            controlOtherPlayer(otherPlayers.children[otherPlayersRef[playerData.id]], playerData);
        }
    });
}
