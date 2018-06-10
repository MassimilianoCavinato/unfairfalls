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
var player;
var otherPlayers;
var playerCollisionGroup;
var otherPlayersRef = {};

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
}

function create(){

    socket = io();
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.stage.disableVisibilityChange = true;
    playerCollisionGroup = game.physics.p2.createCollisionGroup();
    otherPlayers = game.add.physicsGroup(Phaser.Physics.P2JS);

    handleSockets();

}

function update(){
    if(typeof(player) !== 'undefined'){
        controlPlayer();
    }
}


function addPlayer(playerId){
    player = game.add.sprite(400, 300, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.12,0.12);
    game.physics.p2.enable([ player ], true);

    player.body.clearShapes();
    player.body.loadPolygon(null, playerPolyRight);
    player.body.mass = 10;
    player.id = playerId;
    player.timestamp = Date.now();
    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides([playerCollisionGroup]);
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
    player.body.rotation = game.physics.arcade.moveToPointer(player, 60, game.input.activePointer, 400);
    if(game.input.x > player.x){
        player.scale.y = Math.abs(player.scale.y);
    }else{
        player.scale.y = - Math.abs(player.scale.y);
    }
    var new_timestamp = Date.now();

    if(new_timestamp - player.timestamp > 20){
        player.timestamp = new_timestamp;
        socket.emit('playerAction', {
            id: player.id,
            x: player.body.x,
            y: player.body.y,
            cx: game.input.activePointer.x,
            cy: game.input.activePointer.y,
            rotation: player.body.rotation,
            speed:  Math.sqrt(Math.pow(player.body.velocity.x, 2) + Math.pow(player.body.velocity.y, 2))
        });
        player.oldPos = {
            x: player.body.x,
            y: player.body.y,
            cx: game.input.activePointer.x,
            cy: game.input.activePointer.y
        };
    }
}

function controlOtherPlayer(otherPlayer, playerData){

    otherPlayer.body.rotation = playerData.rotation;
    otherPlayer.body.x = playerData.x;
    otherPlayer.body.y = playerData.y;
    otherPlayer.body.speed = playerData.speed;
    // }

    game.physics.arcade.moveToXY(otherPlayer, playerData.cx, playerData.cy, playerData.speed);

    if(playerData.cx > playerData.x){
        otherPlayer.scale.y = Math.abs(otherPlayer.scale.y);
    }else{
        otherPlayer.scale.y = - Math.abs(otherPlayer.scale.y);
    }
}

function render() {

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
