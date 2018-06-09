// var game = new Phaser.Game(
//     800,
//     600,
//     Phaser.AUTO,
//     document.getElementById('unfairfalls')
// );
// game.state.add('Game',Game);
// game.state.start('Game');
// var Game = {};
// Game.init = function(){
//     game.stage.disableVisibilityChange = true;
// };
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

var player;
var poly;

function preload(){
    game.load.image('player', 'https://unfairfalls.herokuapp.com/assets/salmon.png');

}

function create(){

    game.physics.startSystem(Phaser.Physics.P2JS);

    createPlayer();
    // game.stage.backgroundColor = '#ccffff';
}

function update(){
    controlPlayer();
}


function createPlayer(){
    poly = new Phaser.Polygon([ new Phaser.Point(200, 100), new Phaser.Point(350, 100), new Phaser.Point(375, 200), new Phaser.Point(150, 200) ]);
    player = game.add.sprite(400, 300, 'player');
    player.anchor.setTo(0.5);
    player.scale.setTo(0.12,0.12);
    game.physics.p2.enable([ player ], true);
    player.body.clearShapes();
    poly = [{
            "shape": [ 0,40, 0,20, 10,28, 10, 33 ]
        },
        {
            "shape": [ 10,33, 10,28, 35,18, 62,28, 62,33, 35,43 ]
        },
    ];
    player.body.loadPolygon(null, poly);
}

function controlPlayer(){
    player.body.rotation = game.physics.arcade.moveToPointer(player, 60, game.input.activePointer, 200);
    player.scale.y = player.x > game.input.x ? - Math.abs(player.scale.y) : Math.abs(player.scale.y);
}


function render() {
    game.debug.body(player);
}
