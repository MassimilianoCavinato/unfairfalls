import Player from 'classes/player.class';
import Stage from 'classes/stage.class';
import phaserConf from 'phaser-conf';


export default class Game {
  constructor() {
    this.phaserGameInstance = new Phaser.Game(phaserConf);
    this.players = [];
    this.mainPlayer = null;
    this.stage = null;
  }

  createStage() {
    this.stage = new Stage(this.phaserGameInstance);
  }

  addPlayer(playerId, isMainPlayer) {
    this.players[playerId] = new Player(this.phaserGameInstance, playerId);
    let playerSprite = this.players[playerId].getInstance();

    this.phaserGameInstance.physics.p2.enable([playerSprite], false);
    this.phaserGameInstance.physics.p2.createSpring(playerSprite, phaserGameInstance.input.activePointer, 20, 10, 1);

    if (isMainPlayer) {
      this.mainPlayer = this.players[playerId];
      this.phaserGameInstance.camera.follow(playerSprite);
    }
  }

  removePlayer(playerId) {
    let playerIds = Object.Keys(this.players);
    if (playerIds.indexOf(playerId) !== -1 && this.mainPlayer.getInstance.id !== playerId) {
      this.players.splice(playerIds.indexOf(playerId), 1);
    }
  }

  isMainPlayerInWater() {
    inWater = this.stage.waterMatrixInstance.children.some(function(waterSprite) {
      return this.mainPlayer.overlap(waterSprite) === true;
    });
  }

}
