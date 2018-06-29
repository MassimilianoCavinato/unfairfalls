import { Player } from './player.module.js';

export var Multiplayer = {
  handleSockets: function() {
    this.socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((playerId, index) => {
        playerId === this.socket.id ? Player.addPlayer(playerId) : Player.addOtherPlayer(playerId);
      });
    });

    this.socket.on('playerActionFinished', function(playerData) {
      if (playerData.id !== this.socket.id) {
        Player.controlOtherPlayer(Player.otherPlayers.children[Player.otherPlayersRef[playerData.id]], playerData);
      }
    });

    this.socket.on('newPlayer', function(playerId) {
      Player.addOtherPlayer(playerId);
    });

    this.socket.on('disconnect', function(playerId) {
      // otherPlayers.children[otherPlayersRef[playerId]].destroy();
      Player.otherPlayers.children.forEach(function(otherPlayer) {
        if (playerId === otherPlayer.id) {
          otherPlayer.destroy();
        }
      });
    });
  },
  initConnection: function() {
    this.socket = io()
  },
  socket: null
}
