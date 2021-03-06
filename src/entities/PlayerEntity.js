import { Physics, Input } from 'phaser';

import { GunEntity } from '../entities/WeaponEntity';

import MEMORIES from '../data/memories.json';
import SKILLS from '../data/skills.json';
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
    this.speechTimer = 0;

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
    this.teleportList = [];
    this.useKey = this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.E);
    this.attackKey = this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    this.healthBar = healthBar;
    this.alive = true;
    this.lastDirection = {
      right: true,
      left: false
    };

    this.equippedWeapon = new GunEntity(this.scene, worldLayer);
    this.endGame = false;
  }

  setTeleportList(newTeleportList) {
    this.teleportList = newTeleportList;
  }

  getMemory() {
    this.speechText.visible = true;

    const unreadMemories = MEMORIES.filter(memory => !memory.read);
    const randomInt = util.randomIntFromInterval(0, unreadMemories.length - 1);
    const selectedMemory = unreadMemories[randomInt];

    this.speechText.text = selectedMemory.description;
    this.speechTimer = this.scene.time.now;

    MEMORIES.find(memory => memory.id === selectedMemory.id).read = true;
    MEMORY_COUNT++;
  }

  terminalUnavailable() {
    this.speechText.visible = true;
    this.speechText.text = 'Looks like it\'s been disconnected...';

    if (util.randomIntFromInterval(0, 10) > 5) {
      this.speechText.text += ' Someone must be watching me.';
    }

    this.speechTimer = this.scene.time.now;
  }

  fallOutOfBounds() {
    this.speechText.visible = true;
    this.speechText.text = 'I need to be more careful.';
    this.speechTimer = this.scene.time.now;
    this.setPosition(this.spawnPosition.x, this.spawnPosition.y);
    this.healthBar.decrease(util.enumHelper.damage.fall);
  }

  teleportTo(destTeleport) {
    if (Input.Keyboard.JustDown(this.useKey) && this.alive) {
      if (destTeleport.name === 'End Level' && !this.speechText.visible) {
        if (MEMORIES.filter(memory => !memory.read).length > 0) {
          this.speechText.visible = true;
          this.speechText.text = 'I need to know more about what happened before I continue.';
          this.speechTimer = this.scene.time.now;
          return;
        }
        this.endGame = true;
        this.healthBar.endGame();
        this.died();
        return;
      }
      const destination = this.teleportList.find(teleport => teleport.name === destTeleport.destination);
      this.setPosition(destination.x, destination.y);
    }
  }

  useConsole(memory) {
    if (!memory.active && Input.Keyboard.JustDown(this.useKey)) {
      return this.terminalUnavailable();
    }

    if (memory.active && Input.Keyboard.JustDown(this.useKey)) {
      memory.active = false;

      return this.getMemory();
    }
  }

  died() {
    // TODO: CHANGET HIS TO BE READ FROM GAME STATE IN FUTURE
    if (this.speechText.text !== 'YOU DEAD' && this.speechText.text !== 'You\'ve fulfilled your destiny...') {
      this.emit('death', this);
    }
    this.speechText.visible = true;
    this.speechText.text = this.endGame ? 'You\'ve fulfilled your destiny...' : 'YOU DEAD';
    this.speechText.setPosition(this.body.x - (this.speechText.displayWidth / 3), this.body.y - (16 + this.speechText.displayHeight));
    this.angle = 75;
    this.body.setVelocityX(0);
    this.body.setVelocityY(0);
  }

  receiveNmeMelee(deltaTime, nme) {
    if (!this.alive) {
      return;
    }

    if (deltaTime - nme.meleeTimer > nme.meleeDelay) {
      this.healthBar.decrease(nme.meleeDmg);
      this.emit('meleeDamage', this);
      nme.meleeTimer = deltaTime;
    }
  }

  update(memoryList) {
    if (!this.alive) {
      this.died();
      return;
    }

    this.scene.physics.overlap(this, memoryList, null, (player, memory) => this.useConsole(memory), this);
    this.scene.physics.overlap(this, this.teleportList, null, (player, teleport) => this.teleportTo(teleport), this);

    this.body.setVelocityX(0);
    this.speechText.setPosition(this.body.x - (this.speechText.displayWidth / 3), this.body.y - (16 + this.speechText.displayHeight));

    if (this.cursors.right.isDown) {
      this.lastDirection.right = true;
      this.lastDirection.left = false;

      this.body.setVelocityX(SPEED)
    } else if (this.cursors.left.isDown) {
      this.lastDirection.right = false;
      this.lastDirection.left = true;

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
