export default class Player {
  constructor(phaserGameInstance, playerId) {
    this.spriteInstance = phaserGameInstance.add.sprite(2200, 14000, sprite);
    this.spriteInstance.id = playerId;
    this.spriteInstance.timestamp = Date.now();
    this.spriteInstance.inputEnabled = true;
    this.spriteInstance.anchor.setTo(0.5);
    this.spriteInstance.events.onInputDown.add(flap, this);
    this.spriteInstance.body.clearShapes();
    this.spriteInstance.body.loadPolygon('charactersData', 'Player');
    this.spriteInstance.body.setCollisionGroup(collisionGroup);
    this.spriteInstance.body.collides(collisionGroup);
  }

  getInstance() {
    return this.spriteInstance;
  }

  flap() {
    if (!inWater) {
      this.spriteInstance.body.angularVelocity = phaserGameInstance.input.activePointer.worldX > this.spriteInstance.x ? 15 : -15;
      this.spriteInstance.body.velocity.y -= 50;
    }
  }

}
