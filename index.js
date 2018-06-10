var http = require('http');
var express = require('express');
var socket = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socket.listen(server);
var players = {};


var port = process.env.PORT || 5000;

app.use('/css',express.static(__dirname + '/css'));
app.use('/src',express.static(__dirname + '/src'));
app.use('/assets',express.static(__dirname + '/assets'));


io.on('connection', function (socket) {
    //CONNECTION
    players[socket.id] = {
        id: socket.id,
    }

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id].id);

    //DISCONNECTION
    socket.on('disconnect', function () {
        // remove this player from our players objec
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
        console.log('user disconnected');
    });

    socket.on('playerAction', function(playerData) {
        players[socket.id] = playerData;
        socket.broadcast.emit('playerActionFinished', players[socket.id]);
    });
});

server.listen(port, function(){
    console.log('Server listening on port :', port);
});

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});
