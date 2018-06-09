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
playerPolyRight = [
    {
        "shape": [
            0,40,
            0,20,
            10,28,
            38,22,
            62,28,
            62,33,
            42,40,
            22,38,
            18,40,
            10,33
        ]
    },
];
playerPolyLeft = [
    {
        "shape": [

            62,-28,
            62,-33,
            42,-40,
            22,-38,
            18,-40,
            10,-33,
            0,-40,
            0,-20,
            10,-28,
            38,-22,
        ]
    },
];

function preload(){
    game.load.image('player', 'https://unfairfalls.herokuapp.com/assets/salmon.png');
}

function create(){

    socket = io();

    game.physics.startSystem(Phaser.Physics.P2JS);
    otherPlayers = game.add.group();

    socket.on('currentPlayers', function (players) {

        Object.keys(players).forEach(function (playerId) {
            playerId === socket.id ? addPlayer(players[playerId].id) : addOtherPlayer(players[playerId].id);
        });
    });

    socket.on('newPlayer', function (playerId) {
        console.log('NEW PLAYER', playerId);
        addOtherPlayer(playerId);
    });

    socket.on('disconnect', function (playerId) {
        console.log('PLAYER DISCONNECTED', playerId);

        otherPlayers.children.forEach(function (otherPlayer) {
            console.log("DISCONNECT ?", otherPlayer.id, playerId);
            if (playerId === otherPlayer.id) {
                otherPlayer.destroy();
            }
        });
    });

    socket.on('playerActionFinished', function (playerData) {
        otherPlayers.children.forEach(function (otherPlayer){

            if(otherPlayer.id === playerData.id && otherPlayer.id != player){

                 // otherPlayer.x = playerData.x;
                 // otherPlayer.y = playerData.y;
                 otherPlayer.x = playerData.x;
                 otherPlayer.y = playerData.y;
                 otherPlayer.rotation = playerData.r;
                 game.physics.p2.enable([ otherPlayer ], true);
                 otherPlayer.body.clearShapes();
                 otherPlayer.body.loadPolygon(null, playerPolyRight);
                 otherPlayer.body.x = playerData.x;
                 otherPlayer.body.y = playerData.y;
                 otherPlayer.body.rotation = playerData.r;
            }
            // if (playerInfo.playerId === otherPlayer.id) {
            //
            //
            // }

        });
    });
}

function update(){

    if(typeof(player) !== 'undefined'){
        controlPlayer();
    }

}


function addPlayer(playerId){

    player = game.add.sprite(400, 300, 'player');
    player.anchor.setTo(0.5);
    player.scale.setTo(0.12,0.12);
    game.physics.p2.enable([ player ], true);
    player.body.clearShapes();
    player.body.loadPolygon(null, playerPolyRight);
    player.id = playerId;

}

function addOtherPlayer(playerId){

    otherPlayer = game.add.sprite(400, 300, 'player');
    otherPlayer.anchor.setTo(0.5);
    game.physics.p2.enable([ otherPlayer ], true);
    otherPlayer.scale.setTo(0.12,0.12);
    otherPlayer.body.clearShapes();
    otherPlayer.body.loadPolygon(null, playerPolyRight);
    otherPlayer.id = playerId;

    otherPlayers.add(otherPlayer);
}

function controlPlayer(){
    player.body.rotation = game.physics.arcade.moveToPointer(player, 60, game.input.activePointer, 400);

    if(game.input.x > player.x){
        player.scale.y = Math.abs(player.scale.y);
        player.body.clearShapes();
        player.body.loadPolygon(null, playerPolyRight);
    }else{
        player.scale.y = - Math.abs(player.scale.y);
        player.body.clearShapes();
        player.body.loadPolygon(null, playerPolyLeft);
    }

    socket.emit('playerAction', {id: player.id, x: player.x, y: player.y, r: player.rotation});

}

//
function render() {
    // game.debug.body(player);
}
