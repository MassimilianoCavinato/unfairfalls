import { Players } from './players.module.js';

export var Multiplayer = {

  socket: null,

  initConnection: function(username) {
    this.socket = io({query: {username: username}});
    console.log(this.socket);
  },

  handleSockets: function() {
      this.socket.on('currentPlayers', (players) => {
        Object.values(players).forEach((playerData) => {
          let isMain = playerData.id == this.socket.id;
          Players.addPlayer(playerData, isMain);
        });
      });

    this.socket.on('playerActionFinished', (playerData) => {
      if (playerData.id !== this.socket.id) {
        Players.controlOther(playerData);
      }
    });

    this.socket.on('newPlayer', (playerData) => {
      Players.addPlayer(playerData, false);
    });

    this.socket.on('disconnect', (playerId) => {
      // otherPlayers.children[otherPlayersRef[playerId]].destroy();
      Players.otherPlayers.children.forEach(function(otherPlayer) {
        if (playerId === otherPlayer.id) {
          otherPlayer.destroy();
        }
      });
    });
  }
}
