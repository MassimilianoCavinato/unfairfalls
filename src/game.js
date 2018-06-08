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
        update: update
    }
);

var player;


function preload(){
    game.load.image('player', 'https://unfairfalls.herokuapp.com/assets/salmon.png');
}

function create(){

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#ccffff';
    createPlayer();

}

function update(){
    controlPlayer();
}


function render() {
    game.debug.bodyInfo(player, 32, 32);
    game.debug.body(player);
}

function createPlayer(){
    player = game.add.sprite(400, 300, 'player');
    player.anchor.setTo(0.5);
    player.scale.setTo(0.12,0.12);
    game.physics.arcade.enable(player);
    player.body.collideWorlBounds = true;
}

function controlPlayer(){
    player.rotation = game.physics.arcade.moveToPointer(player, 2000, game.input.activePointer, 240);
    player.scale.y = player.x > game.input.x ? - Math.abs(player.scale.y) : Math.abs(player.scale.y);
}
