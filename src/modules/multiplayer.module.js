import { Player } from './player.module.js';
import { globals } from './../globals.js';

export function handleSockets() {
  globals.socket.on('currentPlayers', function(players) {
    Object.keys(players).forEach(function(playerId, index) {
      playerId === globals.socket.id ? Player.addPlayer(playerId) : Player.addOtherPlayer(playerId);
    });
  });

  globals.socket.on('playerActionFinished', function(playerData) {
    if (playerData.id !== globals.socket.id) {
      Player.controlOtherPlayer(globals.otherPlayers.children[globals.otherPlayersRef[playerData.id]], playerData);
    }
  });

  globals.socket.on('newPlayer', function(playerId) {
    Player.addOtherPlayer(playerId);
  });

  globals.socket.on('disconnect', function(playerId) {
    // otherPlayers.children[otherPlayersRef[playerId]].destroy();
    globals.otherPlayers.children.forEach(function(otherPlayer) {
      if (playerId === otherPlayer.id) {
        otherPlayer.destroy();
      }
    });
  });
}
