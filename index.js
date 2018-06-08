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

server.listen(port, function(){
    console.log('Server listening on port :', port);
});

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});
