import { Game } from 'phaser';

// Scenes
import GameScene from './scenes/GameScene';

class LDGame extends Game {
  constructor() {
    super(config);
  }
}
const config = {
  type: Phaser.CANVAS,
  width: (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 16,
  height: (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 16,
  parent: 'container',
  autoResize: true,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 400
      },
    },
  },
  scene: new GameScene()
};
module.export = new LDGame(config);
