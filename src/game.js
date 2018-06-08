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
    '',
    {
        preload: preload,
        create: create,
        update: update
    }
);

var salmon;
var speed;
var stamina;
var spaceKey;
var underControl;

function preload(){
    game.load.image('salmon', 'http://localhost:5000/assets/salmon.png');
}

function create(){

    salmon = game.add.sprite(400, 300, 'salmon');
    stamina = 50;
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    underControl = true;
    speed = 200;

    salmon.anchor.setTo(0.5);
    salmon.scale.setTo(0.2,0.2);
    game.physics.arcade.enable(salmon);
    game.stage.backgroundColor = '#ccffff';
    salmon.body.collideWorlBounds = true;
}

function update(){
    controlSalmon();
}

function controlSalmon(){

    if(speed > 1400){
        speed = 1400;
    }
    if(speed < 200){
        speed = 200;
    }
    if(spaceKey.justDown && stamina > 10){
        speed = 400;
    }

    if(spaceKey.isDown){

        if(stamina > 0){
            speed += 25;
            stamina--;
        }
        else{
            if(speed > 200){
                speed -= 50;
            }
        }
    }
    else{
        if(speed > 200){
            speed -= 50;
        }

        if(stamina < 50){
            stamina += 0.5;
        }
    }

    if(Math.abs(salmon.x - game.input.x) < 40 && Math.abs(salmon.y - game.input.y) < 40){
        game.physics.arcade.moveToPointer(salmon, 0);
    }
    else{
        game.physics.arcade.moveToPointer(salmon, speed);
        salmon.rotation = game.physics.arcade.angleToPointer(salmon);
        if(salmon.x > game.input.x){
            salmon.scale.y = - Math.abs(salmon.scale.y);
        }
        else{
            salmon.scale.y = Math.abs(salmon.scale.y);
        }
    }
    console.log(stamina, speed);
}
