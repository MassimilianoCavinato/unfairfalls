var http = require('http');
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socket.listen(server);


var port = process.env.PORT || 5000;

app.use('/css',express.static(__dirname + '/css'));
app.use('/src',express.static(__dirname + '/src'));
app.use('/assets',express.static(__dirname + '/assets'));


var players = {};

io.on('connection', function (socket) {
    //CONNECTION
    players[socket.id] = { id: socket.id, username: socket.handshake.query.username};
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);
    console.log('User', socket.handshake.query.username, 'just connected!');
    //DISCONNECTION
    socket.on('disconnect', function () {
        delete players[socket.id];
        io.emit('disconnect', socket.id);
        console.log('User', socket.id, 'just disconnected...');
    });

    //ACTIONS
    socket.on('playerAction', function(playerData) {
        players[socket.id] = playerData;
        socket.broadcast.emit('playerActionFinished', playerData);
    });
});

server.listen(port, () => console.log('Server listening on port :', port));
app.get('/', (req,res) => res.sendFile(__dirname+'/index.html'));
