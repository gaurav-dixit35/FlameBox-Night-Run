// scenes/PreloadScene.js
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('box', './assets/box-idle.png');
  }

  create() {
    this.add.text(380, 250, 'Flamebox: Night Run', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.add.image(480, 320, 'box');

    // Temporary move to next scene or game later
    // this.scene.start('LoginScene');
  }
}
