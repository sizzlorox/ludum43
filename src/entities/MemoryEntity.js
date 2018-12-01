import { Class } from 'phaser';

export default new Class({
  Extends: Phaser.GameObjects.Image,
  initialize: function Memory(scene, x, y) {
    Phaser.GameObjects.Image.call(this, scene, x, y, 'memory');
  },
  update: function (time, delta) {
  }
});
