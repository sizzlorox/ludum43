import { Physics } from 'phaser';

// CONSTANTS
const SPEED = 175;

export default class Player extends Physics.Arcade.Sprite {
  constructor(config, worldLayer, cursors) {
    super(config.scene, config.x, config.y , config.key);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.scene.physics.add.collider(this, worldLayer);

    // TIMERS
    this.jumpTimer = 0;
    
    // handlers
    this.cursors = cursors;
  }

  getMemory() {
    console.log('GOT MEMORY');
  }

  update() {
    this.body.setVelocityX(0);
  
    if (this.cursors.right.isDown) {
      this.body.setVelocityX(SPEED)
    } else if (this.cursors.left.isDown) {
      this.body.setVelocityX(-SPEED)
    }
  
    if (this.cursors.up.isDown) {
      if (this.body.onFloor() && this.jumpTimer === 0) {
        this.jumpTimer = 1;
        this.body.setVelocityY(-SPEED);
      } else if (this.body.onFloor() && this.jumpTimer !== 0) {
        this.jumpTimer = 0;
      }
    }
  }
};
