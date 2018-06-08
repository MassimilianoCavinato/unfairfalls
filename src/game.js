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
    game.load.image('player', 'http://localhost:5000/assets/salmon.png');
}

function create(){

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#ccffff';
    createPlayer();

}

function update(){
    controlPlayer();
}


// function render() {
//     game.debug.bodyInfo(player, 32, 32);
//     game.debug.body(player);
// }

function createPlayer(){
    player = game.add.sprite(400, 300, 'player');
    player.anchor.setTo(0.5);
    player.scale.setTo(0.12,0.12);
    game.physics.arcade.enable(player);
    player.body.collideWorlBounds = true;
}

function controlPlayer(){
    player.rotation = game.physics.arcade.moveToPointer(player, 0, game.input.activePointer, 280);
    player.scale.y = player.x > game.input.x ? - Math.abs(player.scale.y) : Math.abs(player.scale.y);

    // if(speed > 1400){
    //     speed = 1400;
    // }
    // if(speed < 200){
    //     speed = 200;
    // }
    // if(spaceKey.justDown && stamina > 10){
    //     speed = 400;
    // }
    //
    // if(spaceKey.isDown){
    //
    //     if(stamina > 0){
    //         speed += 25;
    //         stamina--;
    //     }
    //     else{
    //         if(speed > 200){
    //             speed -= 50;
    //         }
    //     }
    // }
    // else{
    //     if(speed > 200){
    //         speed -= 50;
    //     }
    //
    //     if(stamina < 50){
    //         stamina += 0.5;
    //     }
    // }
    //
    // if(Math.abs(player.x - game.input.x) < 40 && Math.abs(player.y - game.input.y) < 40){
    //     game.physics.arcade.moveToPointer(player, 0);
    // }
    // else{
    //     game.physics.arcade.moveToPointer(player, speed);
    //     player.rotation = game.physics.arcade.angleToPointer(player);
    //
    // }
    // console.log(stamina, speed);
}
