import { Physics, Input } from 'phaser';

import { GunEntity } from '../entities/WeaponEntity';

import MEMORIES from '../data/memories.json';
import util from '../util';

// TODO: Add combat, memory counter

let MEMORY_COUNT = 0;

// CONSTANTS
const SPEED = 175;

export default class Player extends Physics.Arcade.Sprite {
  constructor(config, worldLayer, cursors, healthBar) {
    super(config.scene, config.x, config.y, config.key);
    this.spawnPosition = { x: config.x, y: config.y };
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.scene.physics.add.collider(this, worldLayer);
    this.body.collideWorldBounds = true;
    this.body.onWorldBounds = true;
    this.playerData = {
      health: 100,
      skills: []
    };

    // TIMERS
    this.jumpTimer = 0;

    // handlers
    this.cursors = cursors;

    // Speech text
    this.speechText = this.scene.make.text({
      add: true,
      x: config.x - 8,
      y: config.y - 16,
      text: 'Memory',
      style: {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center'
      }
    });
    this.speechText.visible = false;
    this.speechTimer = 0;
    this.teleportList = [];
    this.useKey = this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.E);
    this.attackKey = this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    this.healthBar = healthBar;
    this.alive = true;

    this.equippedWeapon = new GunEntity(this.scene);
  }

  setTeleportList(newTeleportList) {
    this.teleportList = newTeleportList;
  }

  getMemory() {
    this.speechText.visible = true;
    const unreadMemories = MEMORIES.filter(memory => !memory.read);
    const randomInt = util.randomIntFromInterval(0, unreadMemories.length - 1);
    this.speechText.text = unreadMemories[randomInt].description;
    this.speechTimer = this.scene.time.now;

    MEMORIES.find(memory => memory.id === unreadMemories[randomInt].id).read = true;
    MEMORY_COUNT++;
  }

  fallOutOfBounds() {
    this.speechText.visible = true;
    this.speechText.text = 'I need to be more careful.';
    this.speechTimer = this.scene.time.now;
    this.setPosition(this.spawnPosition.x, this.spawnPosition.y);
    this.healthBar.decrease(util.enumHelper.damage.fall);
  }

  teleportTo(destTeleport) {
    if (Input.Keyboard.JustDown(this.useKey)) {
      const destination = this.teleportList.find(teleport => teleport.name === destTeleport.destination);
      this.setPosition(destination.x, destination.y);
    }
  }

  update(memoryList) {
    if (!this.alive) {
      this.speechText.visible = true;
      this.speechTimer = this.scene.time.now;
      this.speechText.text = 'YOU DEAD';

      return;
    }

    this.scene.physics.overlap(this, memoryList, this.getMemory, (player, memory) => memory.destroy(), this);
    this.scene.physics.overlap(this, this.teleportList, null, (player, teleport) => this.teleportTo(teleport), this);

    this.body.setVelocityX(0);
    this.speechText.setPosition(this.body.x - (this.speechText.displayWidth / 3), this.body.y - (16 + this.speechText.displayHeight));

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

    if (this.speechText.visible && (this.scene.time.now - this.speechTimer) > 1750) {
      this.speechText.visible = false;
    }

    if (!this.healthBar.value) {
      this.alive = false;
    }

    this.attackUpdate();
  }

  attackUpdate() {
    if (Input.Keyboard.JustDown(this.attackKey) == false || !this.equippedWeapon) {
      return;
    }

    this.equippedWeapon.attack(this.scene, this);
  }
};
