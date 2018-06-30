import { Players } from './players.module.js';

export var Multiplayer = {

  socket: null,

  initConnection: function(username, skin) {
    this.socket = io({query: {username: username, skin: skin}});
    Players.decreaseOxygen();
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
      let player = Players.others[playerId];
      Players.setCarcass(player);
      player.username_tag.destroy();
      player.destroy();
    });

    this.socket.on('dead', (playerId) => {
      Players.setCarcass(Players.others[playerId]);
      Players.killAndRespawn(Players.others[playerId]);
    });
  }
}
