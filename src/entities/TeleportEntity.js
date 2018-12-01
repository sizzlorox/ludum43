import { Physics } from 'phaser';

export default class Teleport extends Physics.Arcade.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.name);
    this.name = config.name;
    this.spawnPosition = { x: config.x, y: config.y };
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setSize(16, 32);
    this.body.setAllowGravity(false);
    this.destination = config.destination;
    this.visible = false;
  }
};